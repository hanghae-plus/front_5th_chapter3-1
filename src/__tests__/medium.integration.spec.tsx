import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';
import { createNotificationMessage } from '../utils/notificationUtils';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요? - Chakra UI가 제공하는 컨텍스트를 사용할 수 있도록 해준다. 테스트 환경에서도 실제 환경과 유사하게 동작하도록 해준다.
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

const mockEvents: Event[] = [
  {
    id: '1',
    title: '이벤트1',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트1 설명',
    location: '이벤트1 장소',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '팀 회의 설명',
    location: '팀 회의 장소',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: mockEvents[0].title,
      date: mockEvents[0].date,
      startTime: mockEvents[0].startTime,
      endTime: mockEvents[0].endTime,
      description: mockEvents[0].description,
      location: mockEvents[0].location,
      category: mockEvents[0].category,
    });

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
    expect(within(eventList).getByText(mockEvents[0].description)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);
    const eventList = await screen.findByTestId('event-list');

    const editButton = within(eventList).getAllByTestId('edit-event-button');
    await user.click(editButton[0]);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 이벤트');
    await user.click(screen.getByTestId('event-submit-button'));

    expect(within(eventList).getByText('수정된 이벤트')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);
    const eventList = await screen.findByTestId('event-list');

    const deleteButton = within(eventList).getAllByTestId('delete-event-button');
    await user.click(deleteButton[0]);

    expect(within(eventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const monthView = screen.getByTestId('month-view');
    const eventInMonthView = await within(monthView).findByText(mockEvents[0].title);
    expect(eventInMonthView).toBeInTheDocument();

    const viewSelect = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewSelect, 'week');
    expect(viewSelect).toHaveValue('week');

    const nextButton = screen.getByRole('button', { name: /Next/i });
    await user.click(nextButton);

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const viewSelect = screen.getByRole('combobox', { name: /view/i });
    await user.selectOptions(viewSelect, 'week');
    expect(viewSelect).toHaveValue('week');

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).getByText(mockEvents[0].title)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);
    setup(<App />);

    const viewSelect = screen.getByRole('combobox', { name: /view/i });
    expect(viewSelect).toHaveValue('month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation(mockEvents);
    setup(<App />);

    const viewSelect = screen.getByRole('combobox', { name: /view/i });
    expect(viewSelect).toHaveValue('month');

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
  });
  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime('2025-01-01');
    setup(<App />);

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]);
    setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation(mockEvents);
    setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const searchInput = within(eventList).getByLabelText(/일정 검색/i);

    await user.type(searchInput, '없는 이벤트');
    expect(within(eventList).queryByText('없는 이벤트')).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categorySelect = screen.getByLabelText('카테고리');

    await user.type(titleInput, '겹치는 일정');
    await user.type(dateInput, mockEvents[0].date);
    await user.type(startTimeInput, mockEvents[0].startTime);
    await user.type(endTimeInput, mockEvents[0].endTime);
    await user.type(descriptionInput, '겹치는 일정 설명');
    await user.type(locationInput, '겹치는 일정 위치');
    await user.selectOptions(categorySelect, '업무');
    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const editButton = within(eventList).getAllByTestId('edit-event-button');
    await user.click(editButton[0]);

    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.clear(dateInput);
    await user.type(dateInput, mockEvents[1].date);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, mockEvents[1].startTime);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, mockEvents[1].endTime);
    await user.click(submitButton);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation(mockEvents);
  const { user } = setup(<App />);

  const eventList = await screen.findByTestId('event-list');
  const editButton = within(eventList).getAllByTestId('edit-event-button');
  await user.click(editButton[0]);

  const notificationTimeInput = screen.getByLabelText('알림 설정');
  await user.selectOptions(notificationTimeInput, '10');
  await user.click(screen.getByTestId('event-submit-button'));

  const eventStartTime = new Date(mockEvents[0].date + 'T' + mockEvents[0].startTime);
  eventStartTime.setMinutes(eventStartTime.getMinutes() - 10);
  vi.setSystemTime(eventStartTime);

  expect(await screen.findByText(createNotificationMessage(mockEvents[0]))).toBeInTheDocument();
});
