import { screen, within, cleanup } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import App from '../App';
import { Event } from '../types';
import render from '../utils/test/render';
import { UserEvent } from '@testing-library/user-event';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import { setupMockHandlerCreation } from '@/__mocks__/handlersUtils';

const mockEvent: Event = {
  id: '1',
  title: '새 일정 123',
  date: '2025-05-12',
  startTime: '10:00',
  endTime: '11:00',
  description: '새 일정 설명',
  location: '새 위치',
  category: '개인',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};

const typeEvent = async (user: UserEvent, event: Event) => {
  const { title, date, startTime, endTime, location, description, category } = event;

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  let user: UserEvent;
  beforeEach(async () => {
    setupMockHandlerCreation(events as Event[]);
    const { user: userEvent } = await render(<App />);
    user = userEvent;
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    await typeEvent(user, mockEvent);

    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('새 일정 123')).toBeInTheDocument();
    expect(within(eventList).getByText('2025-05-12')).toBeInTheDocument();
    expect(within(eventList).getByText('새 일정 설명')).toBeInTheDocument();
    expect(within(eventList).getByText('새 위치')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    await typeEvent(user, mockEvent);

    const [firstEvent] = screen.getAllByTestId('event-item');

    expect(within(firstEvent).getByRole('button', { name: 'Edit event' })).toBeInTheDocument();

    await user.click(within(firstEvent).getByRole('button', { name: 'Edit event' }));

    await user.clear(screen.getByLabelText('위치'));
    expect(screen.getByLabelText('위치')).toHaveValue('');
    await user.type(screen.getByLabelText('위치'), '회의실');
    expect(screen.getByLabelText('위치')).toHaveValue('회의실');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).queryByText('새 위치')).not.toBeInTheDocument();
    expect(within(eventList).getByText('회의실')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    await typeEvent(user, mockEvent);

    const [firstEvent] = screen.getAllByTestId('event-item');

    await user.click(within(firstEvent).getByRole('button', { name: 'Delete event' }));

    expect(within(firstEvent).queryByText('새 일정 123')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});

afterEach(cleanup);
