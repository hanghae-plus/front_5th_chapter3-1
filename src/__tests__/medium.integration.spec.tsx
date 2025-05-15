import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { AppProviders } from '../AppProviders';
import { server } from '../setupTests';
import { Event } from '../types';
import { getTestEvents } from './fixtures/eventFactory';

const user = userEvent.setup();
const events = getTestEvents('integration');

describe('일정 관리 기능 테스트', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-05-20T09:50:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    server.resetHandlers();
  });
  describe('일정 CRUD 및 기본 기능', () => {
    it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
      // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      await user.type(screen.getByLabelText('제목'), '팀 미팅');
      await user.type(screen.getByLabelText('날짜'), '2025-05-27');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:30');
      await user.type(screen.getByLabelText('설명'), '주간 팀 회의');
      await user.type(screen.getByLabelText('위치'), '회의실 A');

      await user.click(screen.getByLabelText('카테고리'));
      await user.click(screen.getByRole('option', { name: '업무' }));

      await user.click(screen.getByLabelText('알림 설정'));
      await user.click(screen.getByRole('option', { name: '10분 전' }));

      await user.click(screen.getByTestId('event-submit-button'));

      const eventList = screen.getByTestId('event-list');

      await waitFor(() => {
        expect(within(eventList).getByText('팀 미팅')).toBeInTheDocument();
        expect(within(eventList).getByText('2025-05-27')).toBeInTheDocument();
        expect(within(eventList).getByText('09:00 - 10:30')).toBeInTheDocument();
        expect(within(eventList).getByText('주간 팀 회의')).toBeInTheDocument();

        expect(within(eventList).getAllByText('회의실 A').length).toBeGreaterThan(0);
        expect(within(eventList).getAllByText('카테고리: 업무').length).toBeGreaterThan(0);

        expect(within(eventList).getByText('알림: 10분 전')).toBeInTheDocument();
      });
    });

    it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
      server.use(...setupMockHandlerUpdating(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const eventList = screen.getByTestId('event-list');

      const eventTitle = '팀 회의';
      await waitFor(() => expect(within(eventList).getByText(eventTitle)).toBeInTheDocument());

      const eventElement = within(eventList).getByTestId(`event-${events[0].id}`);

      const editButton = within(eventElement).getByRole('button', { name: 'Edit event' });
      await user.click(editButton);

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '팀 미팅 수정');
      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(within(eventList).getByText('팀 미팅 수정')).toBeInTheDocument());
    });

    it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
      server.use(...setupMockHandlerDeletion(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const eventList = screen.getByTestId('event-list');

      const eventTitle = '팀 회의';
      await waitFor(() => expect(within(eventList).getByText(eventTitle)).toBeInTheDocument());

      const eventElement = within(eventList).getByTestId(`event-${events[0].id}`);

      const deleteButton = within(eventElement).getByRole('button', { name: 'Delete event' });
      await user.click(deleteButton);

      await waitFor(() =>
        expect(within(eventList).queryByText(eventTitle)).not.toBeInTheDocument()
      );
    });
  });

  describe('일정 뷰', () => {
    it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const viewSelect = screen.getByRole('combobox', { name: /view/i });
      await user.selectOptions(viewSelect, 'week');

      await waitFor(() => expect(screen.getByTestId('week-view')).toBeInTheDocument());

      await user.click(screen.getByLabelText('Next'));
      await user.click(screen.getByLabelText('Next'));

      const dateCells = within(screen.getByTestId('week-view')).getAllByRole('cell');

      dateCells.forEach((cell) => {
        const dateText = within(cell).getByText(/^\d+$/);

        const allTextElements = cell.querySelectorAll('.chakra-text');
        expect(allTextElements.length).toBe(1);
        expect(allTextElements[0]).toBe(dateText);

        const eventBoxes = cell.querySelectorAll('.chakra-box, [data-testid^="event-"]');
        expect(eventBoxes.length).toBe(0);
      });
    });

    it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const viewSelect = screen.getByRole('combobox', { name: /view/i });
      await user.selectOptions(viewSelect, 'week');

      const weekView = await screen.findByTestId('week-view');

      await waitFor(() => {
        expect(within(weekView).getByText('팀 회의')).toBeInTheDocument();
        expect(within(weekView).getByText('점심 약속')).toBeInTheDocument();
        expect(within(weekView).getByText('운동')).toBeInTheDocument();
      });
    });

    it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      await user.click(screen.getByLabelText('Next'));

      const monthView = screen.getByTestId('month-view');
      expect(monthView).toBeInTheDocument();

      const eventList = screen.getByTestId('event-list');
      const searchPlaceHolder = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      const notFoundLabel = within(eventList).getByText('검색 결과가 없습니다.');

      expect(searchPlaceHolder).toBeInTheDocument();
      expect(notFoundLabel).toBeInTheDocument();
    });

    it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const monthView = screen.getByTestId('month-view');

      await waitFor(() => {
        expect(within(monthView).getByText('팀 회의')).toBeInTheDocument();
        expect(within(monthView).getByText('점심 약속')).toBeInTheDocument();
        expect(within(monthView).getByText('프로젝트 마감')).toBeInTheDocument();
        expect(within(monthView).getByText('생일 파티')).toBeInTheDocument();
        expect(within(monthView).getByText('운동')).toBeInTheDocument();
      });
    });

    it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
      server.use(...setupMockHandlerCreation([]));
      render(<App />, { wrapper: AppProviders });

      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByLabelText('Previous'));
      }

      const monthView = screen.getByTestId('month-view');

      await waitFor(() => {
        const holiday = within(monthView).getByText('신정');
        expect(holiday).toBeInTheDocument();
        expect(holiday).toHaveClass('css-19gpx6');
      });
    });
  });

  describe('검색 기능', () => {
    it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const eventList = screen.getByTestId('event-list');

      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '아무 글자나 입력');

      const notFoundLabel = within(eventList).getByText('검색 결과가 없습니다.');

      expect(notFoundLabel).toBeInTheDocument();
    });

    it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀 회의');

      const eventTitle = within(eventList).getByText('팀 회의');
      expect(eventTitle).toBeInTheDocument();
    });

    it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await user.type(searchInput, '팀 회의');

      await user.clear(searchInput);

      await waitFor(() => {
        expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
        expect(within(eventList).getByText('점심 약속')).toBeInTheDocument();
        expect(within(eventList).getByText('프로젝트 마감')).toBeInTheDocument();
        expect(within(eventList).getByText('생일 파티')).toBeInTheDocument();
        expect(within(eventList).getByText('운동')).toBeInTheDocument();
      });
    });
  });

  describe('일정 충돌', () => {
    it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
      server.use(...setupMockHandlerCreation(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      await user.type(screen.getByLabelText('제목'), '팀 미팅');
      await user.type(screen.getByLabelText('날짜'), '2025-05-25');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:30');

      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
    });

    it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
      server.use(...setupMockHandlerUpdating(events as Event[]));
      render(<App />, { wrapper: AppProviders });

      const eventList = screen.getByTestId('event-list');

      const eventTitle = '점심 약속';
      await waitFor(() => expect(within(eventList).getByText(eventTitle)).toBeInTheDocument());

      const eventElement = within(eventList).getByTestId(`event-${events[0].id}`);

      const editButton = within(eventElement).getByRole('button', { name: 'Edit event' });
      await user.click(editButton);

      await user.clear(screen.getByLabelText('날짜'));
      await user.type(screen.getByLabelText('날짜'), '2025-05-25');

      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '10:30');

      await user.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
    });
  });
});

describe('알림 기능 테스트', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-05-20T09:59:00'));
  });

  it('notificationTime을 1로 하면 지정 시간 1분 전 알람 텍스트가 노출된다', async () => {
    server.use(...setupMockHandlerCreation(events));

    render(<App />, { wrapper: AppProviders });

    const notification = await screen.findByText('1분 후 팀 회의 일정이 시작됩니다.');
    expect(notification).toBeInTheDocument();
  });
});
