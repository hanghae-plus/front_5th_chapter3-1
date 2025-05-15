import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const newEvent = {
      title: '과제하는 날',
      date: '2025-10-06',
      startTime: '18:00',
      endTime: '23:59',
      description: '졸려요',
      location: '안양',
      category: '개인',
    };

    await saveSchedule(user, newEvent);

    expect(screen.getAllByText('일정 추가')[0]).toBeInTheDocument();
    expect(screen.getByText('2025-10-06')).toBeInTheDocument();
    expect(screen.getByText('18:00 - 23:59')).toBeInTheDocument();
    expect(screen.getByText('졸려요')).toBeInTheDocument();
    expect(screen.getByText('안양')).toBeInTheDocument();
    expect(screen.getByText('개인')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    const titleInput = await screen.findByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '밤새는 날');

    const locationInput = screen.getByLabelText('위치');
    await user.clear(locationInput);
    await user.type(locationInput, '내 방');

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const eventList = await screen.findByTestId('event-list');

    const events = within(eventList);
    expect(events.getByText('밤새는 날')).toBeInTheDocument();
    expect(events.getByText('내 방')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const eventTitle = '밤새는 날';

    const deleteButton = await screen.findByLabelText(`Delete event`);
    await user.click(deleteButton);

    const confirmButton = screen.queryByRole('button', { name: /확인|삭제/i });
    if (confirmButton) {
      await user.click(confirmButton);
    }

    await waitFor(() => {
      expect(screen.queryByText(eventTitle)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);

    const viewSelect = await screen.findByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText(/검색 결과가 없습니다\./i)).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const newEvent = {
      title: '과제하는 날',
      date: '2025-10-03',
      startTime: '19:00',
      endTime: '23:00',
      description: '졸려요',
      location: '안양',
      category: '개인',
    };

    await saveSchedule(user, newEvent);

    const viewSelect = await screen.findByLabelText('view');
    await user.selectOptions(viewSelect, 'week');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText(newEvent.title)).toBeInTheDocument();
  });
  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const { user } = setup(<App />);

    const view = await screen.findByLabelText('view');
    await user.selectOptions(view, 'month');

    await user.click(screen.getByLabelText('Next'));

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);

    const view = await screen.findByLabelText('view');
    await user.selectOptions(view, 'month');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('기존 팀 미팅')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    const monthView = await screen.findByTestId('month-view');
    const janFirst = within(monthView).getByText('1').parentElement as HTMLElement;

    expect(within(janFirst).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]);
    setup(<App />);
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await userEvent.type(searchInput, '없는 일정');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = await screen.findByLabelText('일정 검색');
    await user.clear(searchInput);
    await user.type(searchInput, '기존 회의');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('기존 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = await screen.findByLabelText('일정 검색');

    await user.clear(searchInput);
    await user.type(searchInput, '졸리다');

    const eventListAfterSearch = await screen.findByTestId('event-list');
    expect(within(eventListAfterSearch).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.clear(searchInput);

    const eventListAfterClear = await screen.findByTestId('event-list');
    expect(within(eventListAfterClear).getByText('기존 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '과제중',
        date: '2025-05-20',
        startTime: '12:00',
        endTime: '13:00',
        description: '졸려요?',
        location: '내 방',
        category: '개인',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 0,
      },
    ]);
    const { user } = setup(<App />);

    const newEvent = {
      title: '중복 일정',
      date: '2025-05-20',
      startTime: '12:30',
      endTime: '13:30',
      description: '졸려요?',
      location: '내 방',
      category: '기타',
    };

    await saveSchedule(user, newEvent);

    const alert = within(await screen.findByRole('alertdialog'));
    expect(alert.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '기존 회의2',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    const dateInput = screen.getByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-10-16');

    await user.click(screen.getByTestId('event-submit-button'));

    const warningDialog = await screen.findByRole('alertdialog');
    expect(warningDialog).toBeInTheDocument();
    expect(within(warningDialog).getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15T08:40:00'));

  setup(<App />);

  await screen.findByText('일정 로딩 완료!');

  act(() => {
    vi.advanceTimersByTime(1000 * 60 * 10);
  });

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
