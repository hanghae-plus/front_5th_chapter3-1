// import { http, HttpResponse } from 'msw';
// import { ReactElement } from 'react';
// import { server } from '../setupTests';

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  const user = userEvent.setup();

  const events = [
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
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // 1. 테스트를 위한 사용자 이벤트 설정

    // 최초 데이터 설정
    setupMockHandlerCreation(events as Event[]);

    // 2. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 폼 필드에 데이터 입력
    await user.type(screen.getByLabelText('제목'), '신규 프로젝트 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-05-20');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '프로젝트 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 5. select 옵션 선택
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
    await user.selectOptions(screen.getByLabelText('알림 설정'), '10');

    // 6. 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 저장된 일정 데이터 확인
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('신규 프로젝트 회의')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 최초 데이터 설정
    setupMockHandlerUpdating(events as Event[]);

    // 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 1. 기존 일정이 렌더링되어 있는지 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
    });

    // 2. 첫 번째 일정의 수정 버튼 클릭
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 3. 폼 필드의 기존 데이터가 올바르게 로드되었는지 확인
    expect(screen.getByLabelText('제목')).toHaveValue('이벤트 1');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-05-15');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');

    // 4. 데이터 수정
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 이벤트');

    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 설명');

    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '수정된 회의실');

    await user.selectOptions(screen.getByLabelText('카테고리'), '개인');
    await user.selectOptions(screen.getByLabelText('알림 설정'), '60');

    // 5. 일정 수정 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 6. 수정된 데이터가 화면에 반영되었는지 확인
    await waitFor(() => {
      const updatedEventList = screen.getByTestId('event-list');
      expect(within(updatedEventList).getByText('수정된 이벤트')).toBeInTheDocument();
      expect(within(updatedEventList).getByText('수정된 설명')).toBeInTheDocument();
      expect(within(updatedEventList).getByText('수정된 회의실')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // 최초 데이터 설정
    setupMockHandlerDeletion(events as Event[]); // 삭제용 mock handler 설정

    // 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 1. 기존 일정이 렌더링되어 있는지 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('이벤트 1')).toBeInTheDocument();
      expect(within(eventList).getByText('이벤트 2')).toBeInTheDocument();
    });

    // 2. 첫 번째 일정의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 3. 삭제된 일정이 더 이상 표시되지 않는지 확인
    await waitFor(() => {
      expect(screen.queryByText('이벤트 1')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  const user = userEvent.setup();

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // 일정이 없는 주의 데이터로 설정
    const emptyWeekEvents: Event[] = [];
    setupMockHandlerCreation(emptyWeekEvents);

    // 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 1. 주별 뷰 선택
    await user.selectOptions(screen.getByRole('combobox', { name: 'view' }), 'week');

    // 2. 주별 뷰가 표시되는지 확인
    const weekView = screen.getByTestId('week-view');

    expect(weekView).toBeInTheDocument();

    // 3. 모든 날짜 셀을 확인하여 일정이 없는지 확인
    const allDayCells = within(weekView).getAllByRole('cell');

    // 각 날짜 셀에서 날짜 숫자를 제외한 일정 관련 텍스트가 없는지 확인
    allDayCells.forEach((cell) => {
      // 날짜 숫자를 제외한 모든 텍스트 노드 확인
      const cellContent = within(cell).queryAllByRole('article');
      expect(cellContent).toHaveLength(0);
    });

    // 이벤트 리스트에서 "검색 결과가 없습니다." 텍스트가 표시되는지 확인
    const noResultsText = screen.getByText('검색 결과가 없습니다.');
    expect(noResultsText).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 테스트용 이벤트 데이터 설정 (같은 주에 있는 일정들)
    const weekEvents: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-05-15', // 목요일
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '프로젝트 미팅',
        date: '2025-05-16', // 금요일
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행상황 공유',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(weekEvents);

    // 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 1. 주별 뷰 선택
    await user.selectOptions(screen.getByRole('combobox', { name: 'view' }), 'week');

    // 2. 주별 뷰가 표시되는지 확인
    const weekView = screen.getByTestId('week-view');
    // expect(weekView).toBeInTheDocument();

    // 3. 일정들이 올바른 날짜 셀에 표시되는지 확인
    await waitFor(() => {
      // expect(screen.getByText('주간 회의')).toBeInTheDocument();
      // expect(screen.getByText('09:00')).toBeInTheDocument();
      // 첫 번째 일정 확인 (목요일)
      const thursdayEvent = within(weekView).getByText('주간 회의');
      expect(thursdayEvent).toBeInTheDocument();

      // 두 번째 일정 확인 (금요일)
      const fridayEvent = within(weekView).getByText('프로젝트 미팅');
      expect(fridayEvent).toBeInTheDocument();
    });

    // 4. 이벤트 리스트에도 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('주간 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('프로젝트 미팅')).toBeInTheDocument();
    });

    // 5. 각 일정의 세부 정보가 정확히 표시되는지 확인
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('회의실 B')).toBeInTheDocument();
    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 진행상황 공유')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // 1. 빈 이벤트 배열로 설정
    const emptyMonthEvents: Event[] = [];
    setupMockHandlerCreation(emptyMonthEvents);

    // 2. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 3. 월별 뷰 선택
    await user.selectOptions(screen.getByRole('combobox', { name: 'view' }), 'month');

    // 4. 월별 뷰가 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 5. 모든 날짜 셀을 확인하여 일정이 없는지 확인
    const allDayCells = within(monthView).getAllByRole('cell');

    // 각 날짜 셀에서 일정 관련 요소가 없는지 확인
    allDayCells.forEach((cell) => {
      const eventElements = within(cell).queryAllByRole('article');
      expect(eventElements).toHaveLength(0);
    });

    // 6. 이벤트 리스트에 "검색 결과가 없습니다" 메시지가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // 1. 테스트용 이벤트 데이터 설정 (같은 달의 여러 일정)
    const monthEvents: Event[] = [
      {
        id: '1',
        title: '월간 보고',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '5월 월간 보고',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '팀 워크샵',
        date: '2025-05-25',
        startTime: '09:00',
        endTime: '18:00',
        description: '팀 빌딩 워크샵',
        location: '양평 연수원',
        category: '기타',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(monthEvents);

    // 2. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 3. 월별 뷰 선택
    await user.selectOptions(screen.getByRole('combobox', { name: 'view' }), 'month');

    // 4. 월별 뷰가 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 5. 일정들이 올바른 날짜 셀에 표시되는지 확인
    await waitFor(() => {
      // 첫 번째 일정 확인 (15일)
      const firstEvent = within(monthView).getByText('월간 보고');
      expect(firstEvent).toBeInTheDocument();

      // 두 번째 일정 확인 (25일)
      const secondEvent = within(monthView).getByText('팀 워크샵');
      expect(secondEvent).toBeInTheDocument();
    });

    // 6. 이벤트 리스트에도 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      // 일정 제목 확인
      expect(within(eventList).getByText('월간 보고')).toBeInTheDocument();
      expect(within(eventList).getByText('팀 워크샵')).toBeInTheDocument();

      // 일정 상세 정보 확인
      expect(within(eventList).getByText('5월 월간 보고')).toBeInTheDocument();
      expect(within(eventList).getByText('팀 빌딩 워크샵')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
      expect(within(eventList).getByText('양평 연수원')).toBeInTheDocument();
    });

    // 7. 날짜가 올바르게 표시되는지 확인
    expect(screen.getByText('2025년 5월')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // 1. 빈 이벤트로 설정 (공휴일 테스트이므로 이벤트는 필요 없음)
    setupMockHandlerCreation([]);

    // 2. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 3. 월별 뷰 선택 (공휴일은 월별 뷰에서 가장 잘 보임)
    await user.selectOptions(screen.getByRole('combobox', { name: 'view' }), 'month');

    // 4. 1월로 이동
    // 현재 달력이 어느 달에 있든 1월로 이동해야 함
    const currentMonthText = screen.getByText(/\d{4}년 \d{1,2}월/);
    while (!currentMonthText.textContent?.includes('2025년 1월')) {
      await user.click(screen.getByRole('button', { name: 'Previous' }));
    }

    // 5. 1월 1일 셀을 찾아서 공휴일 표시 확인
    const monthView = screen.getByTestId('month-view');
    await waitFor(() => {
      // 신정 텍스트가 있는지 확인
      expect(within(monthView).getByText('신정')).toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  const user = userEvent.setup();
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // 1. 테스트용 이벤트 데이터 설정
    const events: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 2. Mock 핸들러 설정
    setupMockHandlerCreation(events);

    // 3. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 검색창이 표시되는지 확인
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    expect(searchInput).toBeInTheDocument();

    // 5. 존재하지 않는 일정 검색
    await user.type(searchInput, '존재하지 않는 일정');

    // 6. 이벤트 리스트에 "검색 결과가 없습니다" 메시지가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    // 7. 기존 일정이 화면에서 보이지 않는지 확인
    expect(screen.queryByText('주간 회의')).not.toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // 1. 테스트용 이벤트 데이터 설정
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '프로젝트 미팅',
        date: '2025-05-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행상황 공유',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 2. Mock 핸들러 설정
    setupMockHandlerCreation(events);

    // 3. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 검색창이 표시되는지 확인
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    expect(searchInput).toBeInTheDocument();

    // 5. '팀 회의' 검색
    await user.type(searchInput, '팀 회의');

    // 6. 이벤트 리스트에서 검색 결과 확인
    const eventList = screen.getByTestId('event-list');
    await waitFor(() => {
      // '팀 회의' 일정이 표시되는지 확인
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
      expect(within(eventList).getByText('팀 미팅')).toBeInTheDocument();

      // 다른 일정은 보이지 않아야 함
      expect(within(eventList).queryByText('프로젝트 미팅')).not.toBeInTheDocument();
      expect(within(eventList).queryByText('회의실 B')).not.toBeInTheDocument();
    });

    // 7. 캘린더 뷰에서도 검색 결과만 표시되는지 확인
    const calendarView = screen.getByTestId('month-view');
    await waitFor(() => {
      expect(within(calendarView).getByText('팀 회의')).toBeInTheDocument();
      expect(within(calendarView).queryByText('프로젝트 미팅')).not.toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // 1. 테스트용 이벤트 데이터 설정
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-05-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '프로젝트 미팅',
        date: '2025-05-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행상황 공유',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 2. Mock 핸들러 설정
    setupMockHandlerCreation(events);

    // 3. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 검색창이 표시되는지 확인
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    expect(searchInput).toBeInTheDocument();

    // 5. 먼저 '팀 회의' 검색
    await user.type(searchInput, '팀 회의');

    // 6. 검색 결과 확인 (팀 회의만 표시)
    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).queryByText('프로젝트 미팅')).not.toBeInTheDocument();
    });

    // 7. 검색어 지우기
    await user.clear(searchInput);

    // 8. 모든 일정이 다시 표시되는지 확인
    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');

      // 모든 일정 제목이 표시되는지 확인
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('프로젝트 미팅')).toBeInTheDocument();

      // 모든 일정의 상세 정보가 표시되는지 확인
      expect(within(eventList).getByText('팀 미팅')).toBeInTheDocument();
      expect(within(eventList).getByText('프로젝트 진행상황 공유')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 B')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  const user = userEvent.setup();

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 1. 기존 일정 데이터 설정
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 2. Mock 핸들러 설정
    setupMockHandlerCreation(events);

    // 3. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 새 일정 추가 버튼 클릭
    const addButton = screen.getByRole('button', { name: '일정 추가' });
    await user.click(addButton);

    // 5. 겹치는 시간에 새 일정 입력
    await user.type(screen.getByLabelText('제목'), '새로운 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-05-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:30');
    await user.type(screen.getByLabelText('종료 시간'), '11:30');
    await user.type(screen.getByLabelText('설명'), '새로운 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
    await user.selectOptions(screen.getByLabelText('알림 설정'), '10');

    // 6. 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 7. 경고 메시지 확인
    await waitFor(() => {
      // 경고 메시지가 표시되는지 확인
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 1. 두 개의 기존 일정 데이터 설정
    const events: Event[] = [
      {
        id: '1',
        title: '첫 번째 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '두 번째 회의',
        date: '2025-05-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 2. Mock 핸들러 설정
    setupMockHandlerCreation(events);
    setupMockHandlerUpdating(events); // 수정을 위한 핸들러 추가

    // 3. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 첫 번째 일정의 수정 버튼 클릭
    await waitFor(() => {
      expect(screen.getAllByLabelText('Edit event')).toHaveLength(2); // 2개의 이벤트가 있으므로
    });
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 5. 시간을 두 번째 일정과 겹치게 수정
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '14:30');
    await user.type(screen.getByLabelText('종료 시간'), '15:30');

    // 6. 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 7. 경고 메시지 확인
    await waitFor(() => {
      // 경고 메시지가 표시되는지 확인
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

describe('알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    // 1. 테스트용 이벤트 데이터 설정
    const events: Event[] = [
      {
        id: '1',
        title: '알람 테스트 회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '알람 테스트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    act(() => {
      vi.setSystemTime(new Date('2025-05-15 09:50:00'));

      setupMockHandlerCreation(events);
    });

    // 3. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const notification = await screen.findByText(`10분 후 ${events[0].title} 일정이 시작됩니다.`);
    expect(notification).toBeInTheDocument();
  });
});
