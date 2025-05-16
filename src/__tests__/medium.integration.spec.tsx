import { ChakraProvider } from '@chakra-ui/react';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { useCalendarView } from '../hooks/useCalendarView';
import { Event, RepeatType } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

type EventFormData = Omit<Event, 'id' | 'notificationTime' | 'repeat'>;

const saveSchedule = async (user: UserEvent, form: EventFormData) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  // 기존 값 지우기
  await user.clear(screen.getByLabelText('제목'));
  await user.clear(screen.getByLabelText('날짜'));
  await user.clear(screen.getByLabelText('시작 시간'));
  await user.clear(screen.getByLabelText('종료 시간'));
  await user.clear(screen.getByLabelText('설명'));
  await user.clear(screen.getByLabelText('위치'));

  // 새 값 입력
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);

  // 카테고리 선택
  const categorySelect = screen.getByLabelText('카테고리');
  await user.selectOptions(categorySelect, category);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    const newEvent: EventFormData = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    // 저장 완료 메시지 대기
    await screen.findByText('일정이 추가되었습니다.');

    const eventList = screen.getByTestId('event-list');
    const eventDetails = within(eventList);

    expect(eventDetails.getByText(newEvent.title)).toBeInTheDocument();
    expect(eventDetails.getByText(newEvent.date)).toBeInTheDocument();
    expect(
      eventDetails.getByText(`${newEvent.startTime} - ${newEvent.endTime}`)
    ).toBeInTheDocument();
    expect(eventDetails.getByText(newEvent.description)).toBeInTheDocument();
    expect(eventDetails.getByText(newEvent.location)).toBeInTheDocument();
    expect(eventDetails.getByText(`카테고리: ${newEvent.category}`)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    //이벤트 리스트 -> 수정하고자 하는 일정의 수정 버튼 클릭
    const eventList = screen.getByTestId('event-list');
    const eventDetails = within(eventList);
    const eventItem = eventDetails.getByTestId('event-1');
    const eventItemDetails = within(eventItem);
    const editButton = eventItemDetails.getByTestId('edit-event-1');

    await user.click(editButton);

    //수정 폼에 해당 일정의 정보가 정확히 표시되는지 확인
    expect(screen.getByLabelText('제목')).toHaveValue('기존 회의');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-10-15');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');
    expect(screen.getByLabelText('설명')).toHaveValue('기존 팀 미팅');

    const updatedEvent: EventFormData = {
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, updatedEvent);
    const updatedEventItem = eventDetails.getByTestId('event-1');
    const updatedEventItemDetails = within(updatedEventItem);
    expect(updatedEventItemDetails.getByText(updatedEvent.title)).toBeInTheDocument();
    expect(updatedEventItemDetails.getByText(updatedEvent.date)).toBeInTheDocument();
    expect(
      updatedEventItemDetails.getByText(`${updatedEvent.startTime} - ${updatedEvent.endTime}`)
    ).toBeInTheDocument();
    expect(updatedEventItemDetails.getByText(updatedEvent.description)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    //이벤트 리스트 -> 수정하고자 하는 일정의 수정 버튼 클릭
    const eventList = screen.getByTestId('event-list');
    const eventDetails = within(eventList);
    const eventItem = eventDetails.getByTestId('event-1');
    const eventItemDetails = within(eventItem);
    const deleteButton = eventItemDetails.getByTestId('delete-event-1');

    await user.click(deleteButton);

    expect(eventDetails.queryByTestId('event-1')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const mockEvents: Event[] = [];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주별 뷰가 표시되는지 확인
    const weekView = screen.getByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 일정이 없는 날짜의 셀에는 일정이 표시되지 않아야 함
    const weekDates = within(weekView).getAllByRole('cell');
    weekDates.forEach((cell) => {
      const dateText = within(cell).queryByText(/\d+/); // 날짜를 찾음
      if (dateText) {
        const date = parseInt(dateText.textContent || '0');
        const eventsForDate = mockEvents.filter((event) => new Date(event.date).getDate() === date);
        const eventElements = within(cell)
          .queryAllByRole('generic')
          .filter(
            (el) =>
              el.tagName.toLowerCase() === 'div' && el.getAttribute('class')?.includes('chakra-box')
          );
        expect(eventElements).toHaveLength(eventsForDate.length);
      }
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 주별 뷰로 변경
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주별 뷰 내에서 일정 확인
    const weekView = screen.getByTestId('week-view');

    // 10월 1일 셀 찾기
    const cells = within(weekView).getAllByRole('cell');
    const targetCell = cells.find((cell) => within(cell).queryByText('1'));

    // mock 데이터의 일정이  표시되는지 확인
    const eventElement = within(targetCell!).getByText(mockEvents[0].title);
    expect(eventElement).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const mockEvents: Event[] = [];
    setupMockHandlerCreation(mockEvents);
    setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 월별 뷰가 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 없는 날짜의 셀에는 일정이 표시되지 않아야 함
    const monthDates = within(monthView).getAllByRole('cell');
    // 모든 날짜 셀에는 일정이 표시되지 않아야 함
    monthDates.forEach((cell) => {
      //data testid로 month-view-event 로 시작하는 요소가 없어야 함
      expect(within(cell).queryByTestId(/month-view-event/)).not.toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '월간 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '월간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 월별 뷰 내에서 일정 확인
    const monthView = screen.getByTestId('month-view');

    // 10월 1일 셀 찾기
    const cells = within(monthView).getAllByRole('cell');
    const targetCell = cells.find((cell) => within(cell).queryByText('1'));

    // mock 데이터의 일정이 모두 표시되는지 확인
    const eventElement = within(targetCell!).getByText(mockEvents[0].title);
    expect(eventElement).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 이전 버튼을 클릭하여 2025년 1월로 이동 (현재는 2025년 10월)
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByLabelText('Previous'));
    }

    // 신정이 표시되는지 확인
    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 존재하지 않는 일정 검색
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '가나다라마바사');

    // "검색 결과가 없습니다." 메시지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '개인 일정',
        date: '2025-10-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '개인 업무',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // '팀 회의' 검색
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // 이벤트 리스트에서 검색된 일정만 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '개인 일정',
        date: '2025-10-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '개인 업무',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 먼저 '팀 회의' 검색
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    // 검색어 지우기
    await user.clear(searchInput);

    // 모든 일정이 다시 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('개인 일정')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '기존 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 겹치는 시간에 새 일정 추가
    const newEvent: EventFormData = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '14:30',
      endTime: '15:30',
      description: '새로운 팀 미팅',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    // 일정 충돌 경고 다이얼로그가 표시되는지 확인
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(within(dialog).getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(within(dialog).getByText(/기존 회의/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '첫 번째 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '두 번째 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // 이벤트들이 로드되었는지 확인
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('첫 번째 회의');
    await within(eventList).findByText('두 번째 회의');

    // 첫 번째 회의 수정 버튼 클릭
    const eventItem = within(eventList).getByTestId('event-1');
    const editButton = within(eventItem).getByTestId('edit-event-1');
    await user.click(editButton);

    // 폼이 기존 값으로 채워져 있는지 확인
    expect(screen.getByLabelText('제목')).toHaveValue('첫 번째 회의');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-10-15');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');
    expect(screen.getByLabelText('설명')).toHaveValue('첫 번째 팀 미팅');
    expect(screen.getByLabelText('위치')).toHaveValue('회의실 A');
    expect(screen.getByLabelText('카테고리')).toHaveValue('업무');

    // 시간을 수정하여 두 번째 회의와 겹치게 만듦
    const updatedEvent: EventFormData = {
      title: '첫 번째 회의',
      date: '2025-10-15',
      startTime: '13:30',
      endTime: '14:30',
      description: '첫 번째 팀 미팅',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, updatedEvent);

    // 일정 충돌 경고 다이얼로그가 표시되기를 기다림
    const dialog = await screen.findByRole('alertdialog', {}, { timeout: 3000 });
    expect(within(dialog).getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(within(dialog).getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(within(dialog).getByText(/두 번째 회의/)).toBeInTheDocument();
  });
});

describe('알림', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-10-01',
        startTime: '00:10', // 현재 시각은 이벤트 시작 10분적이 되도록
        endTime: '00:20',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents);
    setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    const alert = await screen.findByRole('alert', {}, { timeout: 3000 });
    expect(within(alert).getByText('10분 후 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });
});
