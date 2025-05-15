import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심 식사',
    location: '수원역',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const formData = {
  title: '스터디',
  date: '2025-10-05',
  startTime: '12:00',
  endTime: '14:30',
  description: '스터디 모임',
  location: '스터디 장소',
  category: '개인',
};
const renderComponent = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

beforeEach(() => {
  vi.setSystemTime(new Date('2025-10-01'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const { handler, getHandler } = setupMockHandlerCreation(mockEvents);
    server.use(handler, getHandler);
    const user = userEvent.setup();

    renderComponent();

    await user.type(screen.getByLabelText('제목'), formData.title);
    await user.type(screen.getByLabelText('날짜'), formData.date);
    await user.type(screen.getByLabelText('시작 시간'), formData.startTime);
    await user.type(screen.getByLabelText('종료 시간'), formData.endTime);
    await user.type(screen.getByLabelText('설명'), formData.description);
    await user.type(screen.getByLabelText('위치'), formData.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), formData.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(formData.title)).toBeInTheDocument();
    expect(within(eventList).getByText(formData.date)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { handler, getHandler } = setupMockHandlerUpdating(mockEvents);
    server.use(handler, getHandler);
    const updateFormData = {
      title: '주간 회의',
      location: '회의실 B',
    };
    const user = userEvent.setup();

    renderComponent();

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);
    const editButton = within(eventItem).getByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const locationInput = screen.getByLabelText('위치');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.clear(titleInput);
    await user.clear(locationInput);

    await user.type(titleInput, updateFormData.title);

    await user.type(locationInput, updateFormData.location);

    await user.click(submitButton);

    const eventList = await screen.findByTestId('event-list');

    expect(within(eventList).getByText(updateFormData.title)).toBeInTheDocument();
    expect(within(eventList).getByText(updateFormData.location)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const { handler, getHandler } = setupMockHandlerDeletion(mockEvents);
    server.use(handler, getHandler);
    const user = userEvent.setup();

    renderComponent();

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);
    const deleteButton = within(eventItem).getByLabelText('Delete event');
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(mockEvents[0].description)).not.toBeInTheDocument();
    expect(within(eventList).queryByText(mockEvents[0].location)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    const { handler, getHandler } = setupMockHandlerCreation(mockEvents);
    server.use(handler, getHandler);
  });
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const user = userEvent.setup();
    vi.setSystemTime(new Date('2025-10-25'));

    renderComponent();

    // * 월별 뷰에 일정이 정확히 표시되는지 확인한다"에서 확인함으로 확인 필요 X
    // const monthEventList = await screen.findByTestId('event-list');
    // expect(within(monthEventList).getByText(mockEvents[0].title)).toBeInTheDocument();
    // expect(within(monthEventList).getByText(mockEvents[0].description)).toBeInTheDocument();
    // expect(within(monthEventList).getByText(mockEvents[0].location)).toBeInTheDocument();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'week');

    const weekEventList = await screen.findByTestId('event-list');
    expect(within(weekEventList).queryByText(mockEvents[0].title)).not.toBeInTheDocument();
    expect(within(weekEventList).queryByText(mockEvents[0].description)).not.toBeInTheDocument();
    expect(within(weekEventList).queryByText(mockEvents[0].location)).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();

    renderComponent();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'week');

    const eventItem = screen.queryByTestId(`event-item-${mockEvents[0].id}`);
    expect(eventItem).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-12-25'));
    const user = userEvent.setup();

    renderComponent();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const eventItem = screen.queryByTestId(`event-item-${mockEvents[0].id}`);
    expect(eventItem).not.toBeInTheDocument();
  });

  // * 이거 필요 없을 듯 함. 아니면 상단으로 올리는게 나을 듯 주간 뷰에서 다시 확인 안하도록
  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const user = userEvent.setup();

    renderComponent();

    const viewSelector = screen.getByLabelText('view');
    await user.selectOptions(viewSelector, 'month');

    const eventItem = screen.getByTestId(`event-item-${mockEvents[0].id}`);
    expect(eventItem).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    renderComponent();

    const calendar = screen.getByTestId('month-view');
    expect(calendar).toBeInTheDocument();

    const holiday = screen.getByText('신정');
    expect(holiday).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    const { handler, getHandler } = setupMockHandlerCreation(mockEvents);
    server.use(handler, getHandler);
  });
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();

    renderComponent();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, 'non-existent-event');

    const noResultsMessage = screen.getByText('검색 결과가 없습니다.');
    expect(noResultsMessage).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();

    renderComponent();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();

    renderComponent();

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, mockEvents[0].title);

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();

    await user.clear(searchInput);

    expect(within(eventList).queryByText(mockEvents[0].title)).toBeInTheDocument();
    expect(within(eventList).queryByText(mockEvents[1].title)).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();
    const { handler, getHandler } = setupMockHandlerCreation(mockEvents);
    server.use(handler, getHandler);

    const duplicateDateFormData = {
      ...formData,
      date: mockEvents[0].date,
      startTime: mockEvents[0].startTime,
      endTime: mockEvents[0].endTime,
    };

    renderComponent();

    await user.type(screen.getByLabelText('제목'), duplicateDateFormData.title);
    await user.type(screen.getByLabelText('날짜'), duplicateDateFormData.date);
    await user.type(screen.getByLabelText('시작 시간'), duplicateDateFormData.startTime);
    await user.type(screen.getByLabelText('종료 시간'), duplicateDateFormData.endTime);
    await user.type(screen.getByLabelText('설명'), duplicateDateFormData.description);
    await user.type(screen.getByLabelText('위치'), duplicateDateFormData.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), duplicateDateFormData.category);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    const alertHeader = await screen.findByText('일정 겹침 경고');
    const alertDialog = await screen.findByRole('alertdialog');

    expect(alertHeader).toBeInTheDocument();
    expect(alertDialog).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();
    const { handler, getHandler } = setupMockHandlerUpdating(mockEvents);
    server.use(handler, getHandler);

    renderComponent();

    const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);
    const editButton = within(eventItem).getByLabelText('Edit event');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const submitButton = screen.getByTestId('event-submit-button');

    await user.clear(dateInput);
    await user.clear(startTimeInput);
    await user.clear(endTimeInput);

    await user.type(dateInput, mockEvents[1].date);

    await user.type(startTimeInput, mockEvents[1].startTime);

    await user.type(endTimeInput, mockEvents[1].endTime);

    await user.click(submitButton);

    const alertHeader = await screen.findByText('일정 겹침 경고');
    const alertDialog = await screen.findByRole('alertdialog');

    expect(alertHeader).toBeInTheDocument();
    expect(alertDialog).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const { handler, getHandler } = setupMockHandlerUpdating(mockEvents);
  server.use(handler, getHandler);

  const user = userEvent.setup();

  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

  const eventItem = await screen.findByTestId(`event-item-${mockEvents[0].id}`);

  const editButton = within(eventItem).getByLabelText('Edit event');
  expect(editButton).toBeInTheDocument();
  await user.click(editButton);

  const notificationTimeSelector = screen.getByLabelText('알림 설정');
  await user.selectOptions(notificationTimeSelector, '10');

  const submitButton = screen.getByTestId('event-submit-button');
  await user.click(submitButton);

  vi.setSystemTime(new Date('2025-10-01T09:50:00'));

  const alertHeader = await screen.findByText(`10분 후 ${mockEvents[0].title} 일정이 시작됩니다.`);
  expect(alertHeader).toBeInTheDocument();
});
