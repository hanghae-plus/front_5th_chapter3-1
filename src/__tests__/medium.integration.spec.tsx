import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  const MOCK_EVENTS = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 1 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 2 설명',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // 최초 데이터 설정
    setupMockHandlerCreation(MOCK_EVENTS as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 일정 정보 입력
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');

    await userEvent.type(titleInput, '팀 회의');
    await userEvent.type(dateInput, '2025-05-20');
    await userEvent.type(startTimeInput, '14:00');
    await userEvent.type(endTimeInput, '15:00');
    await userEvent.type(descriptionInput, '주간 회의');
    await userEvent.type(locationInput, '회의실');
    await userEvent.selectOptions(categoryInput, '업무');

    // 저장 버튼 클릭
    const saveButton = screen.getByTestId('event-submit-button');
    await userEvent.click(saveButton);

    // 저장된 일정이 리스트에 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');

    expect(eventItems).toHaveLength(MOCK_EVENTS.length + 1);

    const newEvent = eventItems[eventItems.length - 1];
    expect(newEvent).toHaveTextContent('팀 회의');
    expect(newEvent).toHaveTextContent('2025-05-20');
    expect(newEvent).toHaveTextContent('14:00');
    expect(newEvent).toHaveTextContent('15:00');
    expect(newEvent).toHaveTextContent('주간 회의');
    expect(newEvent).toHaveTextContent('회의실');
    expect(newEvent).toHaveTextContent('업무');

    // 월별 뷰에 일정이 정확히 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    const monthViewEvent = within(monthView).getByText('팀 회의');
    expect(monthViewEvent).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerCreation(MOCK_EVENTS as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');

    const eventItem = eventItems[0];

    const editButton = within(eventItem).getByTestId('edit-button');
    await userEvent.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');

    await Promise.all([
      userEvent.clear(titleInput),
      userEvent.clear(dateInput),
      userEvent.clear(startTimeInput),
      userEvent.clear(endTimeInput),
      userEvent.clear(descriptionInput),
      userEvent.clear(locationInput),
    ]);

    const editedEvent = {
      title: '이벤트 수정',
      date: '2025-05-17',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 수정 설명',
      location: '회의실 수정',
      category: '기타',
    };

    // 일정 수정 정보 입력
    await userEvent.type(titleInput, editedEvent.title);
    await userEvent.type(dateInput, editedEvent.date);
    await userEvent.type(startTimeInput, editedEvent.startTime);
    await userEvent.type(endTimeInput, editedEvent.endTime);
    await userEvent.type(descriptionInput, editedEvent.description);
    await userEvent.type(locationInput, editedEvent.location);
    await userEvent.selectOptions(categoryInput, editedEvent.category);

    // 수정 정보 저장
    const saveButton = screen.getByTestId('event-submit-button');
    await userEvent.click(saveButton);

    // 수정된 일정이 리스트에 표시되는지 확인
    const newEventList = await screen.findByTestId('event-list');
    const newEventItems = within(newEventList).getAllByTestId('event-item');

    const updatedEvent = newEventItems[0];

    expect(updatedEvent).toHaveTextContent(editedEvent.title);
    expect(updatedEvent).toHaveTextContent(editedEvent.date);
    expect(updatedEvent).toHaveTextContent(editedEvent.startTime);
    expect(updatedEvent).toHaveTextContent(editedEvent.endTime);
    expect(updatedEvent).toHaveTextContent(editedEvent.description);
    expect(updatedEvent).toHaveTextContent(editedEvent.location);
    expect(updatedEvent).toHaveTextContent(editedEvent.category);

    // 월별 뷰에 수정된 일정이 정확히 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    const monthViewEvent = within(monthView).getByText(editedEvent.title);
    expect(monthViewEvent).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerCreation(MOCK_EVENTS as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');

    const eventItem = eventItems[0];
    const deleteButton = within(eventItem).getByTestId('delete-button');
    await userEvent.click(deleteButton);

    // 삭제된 일정이 리스트에 표시되지 않는지 확인
    const newEventList = await screen.findByTestId('event-list');
    const newEventItems = within(newEventList).getAllByTestId('event-item');

    const deletedEvent = newEventItems[0];
    expect(newEventItems).toHaveLength(MOCK_EVENTS.length - 1);
    expect(deletedEvent).not.toHaveTextContent(MOCK_EVENTS[0].title);

    // 월별 뷰에 삭제된 일정이 표시되지 않는지 확인
    const monthView = screen.getByTestId('month-view');
    const monthViewEvent = within(monthView).queryByText(MOCK_EVENTS[0].title);
    expect(monthViewEvent).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const MOCK_EVENTS = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '이벤트 1 설명',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
      },
    ];

    setupMockHandlerCreation(MOCK_EVENTS as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await userEvent.selectOptions(selectView, 'week');

    const weekView = screen.getByTestId('week-view');
    // 해당 주의 모든 날짜 셀에 이벤트가 없는지 확인
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      const dateCell = within(weekView).getByText(day);
      const eventBoxes = within(dateCell.parentElement!).queryAllByTestId('event-item');
      expect(eventBoxes).toHaveLength(0);
    });

    // 이벤트 리스트에서 "검색 결과가 없습니다." 텍스트가 표시되는지 확인
    const noResultsText = screen.getByText('검색 결과가 없습니다.');
    expect(noResultsText).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const MOCK_EVENTS = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '이벤트 1 설명',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
      },
    ];

    setupMockHandlerCreation(MOCK_EVENTS as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await userEvent.selectOptions(selectView, 'week');

    const weekView = screen.getByTestId('week-view');
    const dateCell = within(weekView).getByText(MOCK_EVENTS[0].date.split('-')[2]);

    // 해당 셀에 이벤트가 정확히 표시되는지 확인
    const eventBox = within(dateCell.parentElement!).getByTestId('event-view-item');
    expect(eventBox).toHaveTextContent(MOCK_EVENTS[0].title);

    // 이벤트 리스트에서도 동일한 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');
    expect(eventItems).toHaveLength(1);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].title);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].date);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].startTime);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].endTime);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].description);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].location);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].category);
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // 5월은 어린이날이 존재하기 때문에 공휴일이 없는 7월로 테스트
    const mockDate = new Date('2025-07-01');
    vi.setSystemTime(mockDate);

    setupMockHandlerCreation([] as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await userEvent.selectOptions(selectView, 'month');

    const monthView = screen.getByTestId('month-view');
    const tdList = within(monthView).getAllByTestId('month-view-td');

    tdList.forEach((td) => {
      const textChildren = Array.from(td.children).filter(
        (child) => child.tagName === 'P' || child.tagName === 'SPAN'
      );

      // 날짜 숫자 텍스트 외에 다른 일정 관련 내용이 없어야 함
      expect(textChildren.length).toBeLessThanOrEqual(1);
    });

    // 이벤트 리스트에서 "검색 결과가 없습니다." 텍스트가 표시되는지 확인
    const noResultsText = screen.getByText('검색 결과가 없습니다.');
    expect(noResultsText).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const MOCK_EVENTS = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-05-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '이벤트 1 설명',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
      },
    ];

    setupMockHandlerCreation(MOCK_EVENTS as Event[]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const selectView = screen.getByLabelText('view');
    await userEvent.selectOptions(selectView, 'month');

    // 월별 뷰에 일정이 정확히 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    const dateCell = within(monthView).getByText(MOCK_EVENTS[0].date.split('-')[2]);
    const eventBox = within(dateCell.parentElement!).getByTestId('event-view-item');
    expect(eventBox).toHaveTextContent(MOCK_EVENTS[0].title);

    // 이벤트 리스트에서도 동일한 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');
    expect(eventItems).toHaveLength(1);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].title);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].date);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].startTime);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].endTime);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].description);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].location);
    expect(eventItems[0]).toHaveTextContent(MOCK_EVENTS[0].category);
  });

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
