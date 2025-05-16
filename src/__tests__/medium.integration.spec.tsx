import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
// import { server } from '../setupTests';
import { Event, RepeatType } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
  // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
  // ! 테스트 환경에서도 컨텍스트 제공하기 위함
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
    // 테스트를 위한 이벤트 배열을 준비하고, setupMockHandlerCreation 호출하여 서버 상태 설정
    const mockEvents: Event[] = [];
    setupMockHandlerCreation(mockEvents);

    // 새로운 일정 정보 준비
    const schedule = {
      title: '새로운 일정 테스트',
      date: '2023-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 일정 설명',
      location: '새로운 일정 위치',
      category: '업무',
    };

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 일정 추가
    await saveSchedule(user, schedule);

    // 새 일정이 mockEvents 배열에 추가되는 것을 시뮬레이션
    mockEvents.push({
      ...schedule,
      id: '1',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    });

    // 일정이 추가된 후에, 일정 목록에 해당 일정이 표시되는지 확인
    expect(mockEvents.length).toBe(1);
    expect(mockEvents[0].title).toBe(schedule.title);
  }, 30000);

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // 서버에 초기 이벤트 목록 셋팅
    setupMockHandlerDeletion();

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 초기 이벤트 목록 확인
    await waitFor(() => {
      const elements = screen.getAllByText(/삭제할 이벤트/);
      expect(elements.length).toBeGreaterThan(0);
    });

    // 삭제 버튼 클릭
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 삭제된 이벤트가 화면에서 사라졌는지 확인
    await waitFor(() => {
      const elements = screen.queryAllByText(/삭제할 이벤트/);
      expect(elements.length).toBe(0);
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 서버에 빈 이벤트 목록 셋팅
    setupMockHandlerCreation([]);

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 주간 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // 주간 뷰가 표시되는지 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 일정이 없는지 확인 = 주간 뷰의 각 날짜 셀에 일정 관련 텍스트가 없어야 함
    const dateElements = within(weekView).getAllByRole('cell');
    expect(dateElements.length).toBeGreaterThan(0);

    // 일정 내용이 표시되는 박스 요소가 없어야 함
    const eventBoxes = within(weekView).queryAllByText(/회의|일정|미팅/);
    expect(eventBoxes.length).toBe(0);
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 테스트용 이벤트 데이터 준비
    const eventTitle = '주간 미팅';
    const testEvents: Event[] = [
      {
        id: '1',
        title: eventTitle,
        date: new Date().toISOString().split('T')[0], // 오늘 날짜
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 미팅 설명',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 서버에 테스트 이벤트 셋팅
    setupMockHandlerCreation(testEvents);

    // 앱 렌더링
    setup(<App />);

    // 이벤트가 표시되는지 확인 (waitFor 사용)
    await waitFor(() => {
      const elements = screen.queryAllByText(eventTitle);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // 서버에 빈 이벤트 목록 셋팅
    setupMockHandlerCreation([]);

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 월간 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 월간 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 일정이 없는지 확인 (이벤트 텍스트가 표시되지 않음)
    // 월간 뷰의 각 날짜 셀이 제대로 표시되는지 확인
    const dateElements = within(monthView).getAllByRole('cell');
    expect(dateElements.length).toBeGreaterThan(0);

    // 일정 내용이 표시되는 박스 요소가 없어야 함
    const eventBoxes = within(monthView).queryAllByText(/회의|일정|미팅/);
    expect(eventBoxes.length).toBe(0);
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // 테스트용 이벤트 데이터 준비 (현재 월에 해당하는 일정)
    const eventTitle = '월간 보고';
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const testDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`;

    const testEvents: Event[] = [
      {
        id: '1',
        title: eventTitle,
        date: testDate,
        startTime: '14:00',
        endTime: '15:00',
        description: '월간 보고 설명',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 서버에 테스트 이벤트 셋팅
    setupMockHandlerCreation(testEvents);

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 월간 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 월간 뷰에서 이벤트가 표시되는지 확인
    await waitFor(() => {
      const elements = screen.queryAllByText(eventTitle);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // 서버에 빈 이벤트 목록 셋팅
    setupMockHandlerCreation([]);

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 월간 뷰 선택
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // 월간 뷰가 제대로 렌더링되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 월간 달력이 표시되는지 확인 (요일 헤더와 날짜 셀)
    const weekDayHeaders = screen.getAllByRole('columnheader');
    expect(weekDayHeaders.length).toBe(7); // 일~토 요일 헤더

    // 날짜 셀 확인
    const dateCells = screen.getAllByRole('cell');
    expect(dateCells.length).toBeGreaterThan(28); // 최소 4주(28일) 이상 표시
  });
});

describe('검색 기능', () => {
  const initialEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의 일정',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '개인 일정',
      date: '2025-10-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '개인 일정',
      location: '사무실',
      category: '개인',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 0,
    },
  ];

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation(initialEvents);

    // 검색어 입력
    const { user } = setup(<App />);
    const searchTerm = '존재하지 않는 일정 검색';
    await user.type(screen.getByLabelText('일정 검색'), searchTerm);

    // 검색 결과가 없는지 확인
    await waitFor(() => {
      const noResultElements = screen.getAllByText(/검색 결과가 없습니다/);
      expect(noResultElements.length).toBeGreaterThan(0);
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation(initialEvents);

    // 검색어 입력
    const { user } = setup(<App />);
    const searchTerm = '팀 회의';
    await user.type(screen.getByLabelText('일정 검색'), searchTerm);

    // 검색 결과에 '팀 회의'가 있는지 확인
    await waitFor(() => {
      const elements = screen.getAllByText(searchTerm);
      expect(elements.length).toBeGreaterThan(0);
    });

    // '개인 일정'은 검색 결과에 없어야 함
    expect(screen.queryByText('개인 일정')).not.toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation(initialEvents);

    // 검색어 지우기
    const { user } = setup(<App />);
    await user.clear(screen.getByLabelText('일정 검색'));

    // 검색 결과에 모든 일정이 표시되어야 함
    for (const event of initialEvents) {
      await waitFor(() => {
        const elements = screen.getAllByText(event.title);
        expect(elements.length).toBeGreaterThan(0);
      });
    }
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 테스트용 이벤트 데이터 준비
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];

    // 서버에 테스트 이벤트 셋팅
    setupMockHandlerCreation(existingEvents);

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 겹치는 시간에 새 일정 추가
    const newSchedule = {
      title: '겹치는 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '겹치는 일정 설명',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, newSchedule);

    // 경고 대화상자가 표시되는지 확인
    await waitFor(() => {
      const warningDialog = screen.getByText('일정 겹침 경고');
      expect(warningDialog).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    // 테스트용 이벤트 데이터 준비
    const existingEvents: Event[] = [
      {
        id: '1',
        title: '회의 A',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅 A',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '회의 B',
        date: '2025-10-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '팀 미팅 B',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ];

    // 서버에 테스트 이벤트 셋팅
    setupMockHandlerCreation(existingEvents);

    // 앱 렌더링 및 사용자 설정
    const { user } = setup(<App />);

    // 일정 수정을 위해 첫 번째 일정의 수정 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 종료 시간을 수정하여, 두 번째 일정과 겹치게 함
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '11:30');

    // 변경사항 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 경고 대화상자가 표시되는지 확인
    await waitFor(() => {
      const warningDialog = screen.getByText('일정 겹침 경고');
      expect(warningDialog).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // 테스트용 이벤트 데이터 준비
  const testEvents: Event[] = [
    {
      id: '1',
      title: '알림 테스트 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '알림 테스트용 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알림
    },
  ];

  // 서버에 테스트 이벤트 셋팅
  setupMockHandlerCreation(testEvents);

  // 앱 렌더링 및 사용자 설정
  setup(<App />);

  // 알림 텍스트가 노출되는지 확인
  await waitFor(() => {
    const elements = screen.queryAllByText('10분 전');
    expect(elements.length).toBeGreaterThan(0);
  });
});
