import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { mockTestDataList } from './data/mockTestData';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import {
  CalendarProvider,
  EventProvider,
  EventOperationProvider,
  NotificationProvider,
  OverlapDialogProvider,
  SearchProvider,
} from '../context';

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2025-05-10T08:00:00'));
});
afterAll(() => {
  vi.useRealTimers();
});

let user: UserEvent;

const renderApp = () => {
  return render(
    <ChakraProvider>
      <CalendarProvider>
        <OverlapDialogProvider>
          <EventProvider>
            <EventOperationProvider>
              <NotificationProvider>
                <SearchProvider>
                  <App />
                </SearchProvider>
              </NotificationProvider>
            </EventOperationProvider>
          </EventProvider>
        </OverlapDialogProvider>
      </CalendarProvider>
    </ChakraProvider>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
  beforeEach(() => {
    server.use(...handlers);
    user = userEvent.setup();

    renderApp();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');

    await user.type(titleInput, 'Test Event');
    await user.type(dateInput, '2025-05-30');
    await user.type(startTimeInput, '21:00');
    await user.type(endTimeInput, '22:00');
    await user.type(descriptionInput, '테스트 설명');
    await user.type(locationInput, '테스트 위치');

    const addButton = screen.getByTestId('event-submit-button');
    await user.click(addButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('Test Event')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-05-30')).toBeInTheDocument();
      expect(within(eventList).getByText('21:00 - 22:00')).toBeInTheDocument();
      expect(within(eventList).getByText('테스트 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('테스트 위치')).toBeInTheDocument();
    });
  });

  it('일정 수정 후 변경된 제목과 설명이 이벤트 리스트에 반영되어야 한다', async () => {
    const { handlers } = setupMockHandlerUpdating(mockTestDataList as Event[]);
    server.use(...handlers);
    // 테스트 중에 event.id 가 '3' 이라고 가정
    const eventId = mockTestDataList[2].id;

    // 1) 해당 이벤트 박스 컨테이너를 가져온다
    const eventBox = await screen.findByTestId(`event-${eventId}`);
    // 2) within 으로 scope 를 좁히고 edit button 클릭
    const { getByRole } = within(eventBox);
    const editButton = getByRole('button', { name: 'Edit event' });
    await user.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const descriptionInput = screen.getByLabelText('설명');

    await userEvent.clear(titleInput);
    await user.type(titleInput, 'Test Event');

    await userEvent.clear(descriptionInput);
    await user.type(descriptionInput, 'Test Description');

    const submitButton = await screen.findByTestId('event-submit-button');
    await user.click(submitButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('Test Event')).toBeInTheDocument();
      expect(within(eventList).getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('일정 삭제 후 해당 일정이 이벤트 리스트에서 사라져야 한다', async () => {
    const { handlers } = setupMockHandlerDeletion(mockTestDataList as Event[]);
    server.use(...handlers);

    // 테스트 중에 event.id 가 '3' 이라고 가정
    const eventId = mockTestDataList[2].id;

    // 1) 해당 이벤트 박스 컨테이너를 가져온다
    const eventBox = await screen.findByTestId(`event-${eventId}`);

    // 2) within 으로 scope 를 좁힌다
    const { getByRole } = within(eventBox);

    const deleteButton = getByRole('button', { name: 'Delete event' });
    await user.click(deleteButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
    });
  });
});

describe('일정 view', () => {
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
    server.use(...handlers);
    renderApp();

    const viewSelect = screen.getByRole('combobox', { name: 'view' });

    await user.selectOptions(viewSelect, 'week');

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      mockTestDataList.forEach((event) => {
        expect(within(eventList).queryByText(event.title)).not.toBeInTheDocument();
      });
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    act(() => {
      vi.setSystemTime(new Date('2025-05-27'));
    });

    const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
    server.use(...handlers);

    renderApp();

    const viewSelect = screen.getByRole('combobox', { name: 'view' });

    await user.selectOptions(viewSelect, 'week');

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText(mockTestDataList[3].title)).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    act(() => {
      vi.setSystemTime(new Date('2025-10-27'));

      const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
      server.use(...handlers);
    });

    renderApp();

    const viewSelect = screen.getByRole('combobox', { name: 'view' });

    await user.selectOptions(viewSelect, 'month');

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      mockTestDataList.forEach((event) => {
        expect(within(eventList).queryByText(event.title)).not.toBeInTheDocument();
      });
    });
    vi.useRealTimers();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
    server.use(...handlers);

    renderApp();

    const viewSelect = screen.getByRole('combobox', { name: 'view' });

    await user.selectOptions(viewSelect, 'month');

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      mockTestDataList.forEach((event) => {
        expect(within(eventList).queryByText(event.title)).toBeInTheDocument();
      });
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    act(() => {
      vi.setSystemTime(new Date('2025-01-11'));

      const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
      server.use(...handlers);
    });

    renderApp();

    const viewSelect = screen.getByRole('combobox', { name: 'view' });

    await user.selectOptions(viewSelect, 'month');

    await waitFor(() => {
      expect(screen.getByText('신정')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe('검색 기능', () => {
  const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
  beforeEach(() => {
    server.use(...handlers);
    user = userEvent.setup();

    renderApp();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '트랄라');

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(searchInput, mockTestDataList[2].title);

    const searchedEvent = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(searchedEvent).getByText(mockTestDataList[2].title)).toBeInTheDocument();
      expect(within(searchedEvent).getByText(mockTestDataList[2].location)).toBeInTheDocument();
      expect(within(searchedEvent).getByText(mockTestDataList[2].description)).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, mockTestDataList[2].title);

    await user.clear(searchInput);

    const searchedEvent = await screen.findByTestId('event-list');

    // mockTestDataList 에 들어있는 각 제목이 모두 있는지 순회 검증
    mockTestDataList.forEach((event) => {
      expect(within(searchedEvent).getByText(event.title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
  beforeEach(async () => {
    // ← async 추가
    server.use(...handlers);
    user = userEvent.setup();

    renderApp();

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('Event A')).toBeInTheDocument();
    });
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');

    await user.type(titleInput, 'Test Event');
    await user.type(dateInput, '2025-05-01');
    await user.type(startTimeInput, '09:00');
    await user.type(endTimeInput, '11:00');
    await user.type(descriptionInput, '테스트 설명');
    await user.type(locationInput, '테스트 위치');

    const addButton = screen.getByTestId('event-submit-button');
    await user.click(addButton);

    const dialog = await screen.findByTestId('overlap-dialog');

    await waitFor(() => {
      expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const { handlers } = setupMockHandlerUpdating(mockTestDataList as Event[]);
    server.use(...handlers);
    // 테스트 중에 event.id 가 '3' 이라고 가정
    const eventId = mockTestDataList[0].id;

    // 1) 해당 이벤트 박스 컨테이너를 가져온다
    const eventBox = await screen.findByTestId(`event-${eventId}`);
    // 2) within 으로 scope 를 좁히고 edit button 클릭
    const { getByRole } = within(eventBox);
    const editButton = getByRole('button', { name: 'Edit event' });
    await user.click(editButton);

    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    await userEvent.clear(startTimeInput);
    await user.type(startTimeInput, '13:00');

    await userEvent.clear(endTimeInput);
    await user.type(endTimeInput, '14:00');

    const submitButton = await screen.findByTestId('event-submit-button');
    await user.click(submitButton);

    const dialog = await screen.findByTestId('overlap-dialog');

    await waitFor(() => {
      expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 20으로 하면 지정 시간 20분 전 알람 텍스트가 노출된다', async () => {
  act(() => {
    vi.setSystemTime(new Date('2025-05-27T12:50:00'));

    const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
    server.use(...handlers);
  });

  renderApp();

  const notification = await screen.findByText('20분 후 Event D 일정이 시작됩니다.');

  await waitFor(() => {
    expect(notification).toBeInTheDocument();
  });
});
