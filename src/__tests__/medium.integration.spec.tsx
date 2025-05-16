import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, fireEvent, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { HandlersBuilder } from '../__mocks__/handlersUtils';
import { createTodayEvent, getDateString } from '../__mocks__/helpers';
import App from '../App';
import { EventProvider } from '../context/event-context';
import { server } from '../setupTests';
import { Event } from '../types';

const renderApp = async (initialEvents: Event[]) => {
  const handlersBuilder = new HandlersBuilder(initialEvents);
  server.use(...handlersBuilder.createAll());

  render(
    <ChakraProvider>
      <EventProvider initialDate={new Date()} initialView="month">
        <App />
      </EventProvider>
    </ChakraProvider>
  );

  await act(() => null);
};

describe('일정 CRUD 및 기본 기능', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = userEvent.setup();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '기존 회의',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    }) satisfies Event;

    await renderApp([todayEvent]);

    // findBy 쿼리를 사용해 이벤트 목록이 로드될 때까지 기다림
    const eventList = await screen.findByTestId('event-list');

    // 첫 번째 이벤트 제목이 나타날 때까지 기다림
    await within(eventList).findByText(todayEvent.title);
    expect(within(eventList).getByText(todayEvent.title)).toBeInTheDocument();

    // 내일 날짜 계산 (현재 날짜에 하루 추가)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = getDateString(tomorrow);

    await user.type(screen.getByLabelText(/제목/i), '테스트 일정');
    await user.type(screen.getByLabelText(/날짜/i), tomorrowFormatted);
    await user.type(screen.getByLabelText(/시작 시간/i), '13:00');
    await user.type(screen.getByLabelText(/종료 시간/i), '14:00');
    await user.type(screen.getByLabelText(/설명/i), '새 일정 설명');
    await user.type(screen.getByLabelText(/위치/i), '회의실');
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/카테고리/i), { target: { value: '개인' } });
    });
    await user.click(screen.getByLabelText(/알림 설정/i));
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/알림 설정/i), { target: { value: '60' } });
    });
    await user.click(screen.getByTestId('event-submit-button'));

    // 저장된 데이터가 표시되는지 확인
    await within(eventList).findByText('테스트 일정');
    expect(within(eventList).getByText(tomorrowFormatted)).toBeInTheDocument();
    expect(within(eventList).getByText('13:00 - 14:00')).toBeInTheDocument();
    expect(within(eventList).getByText('새 일정 설명')).toBeInTheDocument();
    expect(within(eventList).getByText('회의실')).toBeInTheDocument();
    expect(within(eventList).getByText('카테고리: 개인')).toBeInTheDocument();
    expect(within(eventList).getByText('알림: 1시간 전')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '기존 회의',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    }) satisfies Event;

    await renderApp([todayEvent]);

    // findBy 쿼리를 사용해 이벤트 목록이 로드될 때까지 기다림
    const eventList = await screen.findByTestId('event-list');

    // 첫 번째 이벤트 제목이 나타날 때까지 기다림
    await within(eventList).findByText(todayEvent.title);
    expect(within(eventList).getByText(todayEvent.title)).toBeInTheDocument();

    // 첫 번째 이벤트의 편집 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 수정할 새 제목과 설명 정의
    const updatedTitle = '수정된 일정 제목';
    const updatedDescription = '수정된 일정 설명';

    // 입력 필드의 기존 내용 삭제 후 새 값 입력
    const titleInput = screen.getByLabelText(/제목/i);
    await user.clear(titleInput);
    await user.type(titleInput, updatedTitle);

    const descriptionInput = screen.getByLabelText(/설명/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, updatedDescription);

    // 카테고리 변경
    const categorySelect = screen.getByLabelText(/카테고리/i);
    fireEvent.change(categorySelect, { target: { value: '가족' } });

    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 이벤트가 목록에 반영되었는지 확인
    await within(eventList).findByText(updatedTitle);
    expect(within(eventList).getByText(updatedDescription)).toBeInTheDocument();
    expect(within(eventList).getByText('카테고리: 가족')).toBeInTheDocument();

    // 원래 값은 더 이상 표시되지 않아야 함
    expect(within(eventList).queryByText(todayEvent.title)).not.toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '기존 회의',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    }) satisfies Event;

    await renderApp([todayEvent]);

    // 이벤트 목록이 로드될 때까지 기다림
    const eventList = await screen.findByTestId('event-list');

    // 첫 번째 이벤트가 목록에 표시되는지 확인
    await within(eventList).findByText(todayEvent.title);
    expect(within(eventList).getByText(todayEvent.title)).toBeInTheDocument();

    // 삭제 버튼 찾기 (aria-label로 찾기)
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    expect(deleteButtons.length).toBeGreaterThan(0);

    // 첫 번째 이벤트 삭제 버튼 클릭
    await user.click(deleteButtons[0]);

    // 삭제된 이벤트가 더 이상 목록에 표시되지 않는지 확인
    await waitFor(() => {
      expect(screen.queryByText(todayEvent.title)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = userEvent.setup();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    await renderApp([]);

    // Week 뷰로 변경
    fireEvent.change(screen.getByTestId('view-select'), { target: { value: 'week' } });

    // Week 뷰가 표시되는지 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 이벤트 목록 또한 비어있어야 함
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // 오늘 날짜 가져오기 (셀 찾는 데 필요)
    const today = new Date();
    const todayDay = today.getDate();

    // createTodayEvent 함수를 사용하여 테스트 이벤트 생성
    const testEvent = createTodayEvent({
      id: '1',
      title: '테스트 일정',
      description: '주간 뷰 테스트용 일정',
      location: '회의실 A',
    });

    // 앱 렌더링
    await renderApp([testEvent]);

    // Week 뷰로 변경
    fireEvent.change(screen.getByTestId('view-select'), { target: { value: 'week' } });

    // 3. Week 뷰 확인
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 4. 모든 테이블 셀(td) 찾기
    const allCells = within(weekView).getAllByRole('cell');

    // 5. 셀을 순회하며 목표 날짜(오늘)에 해당하는 셀 찾기
    let targetCell = null;
    for (const cell of allCells) {
      // 날짜 텍스트 확인
      const dateText = within(cell).queryByText(todayDay.toString());
      if (dateText) {
        targetCell = cell;
        break;
      }
    }

    // 6. 목표 날짜 셀이 존재하는지 확인
    expect(targetCell).not.toBeNull();

    // 7. 셀 내부에 이벤트가 표시되는지 확인
    if (targetCell) {
      // 이벤트 박스 내부에 테스트 일정 제목이 있는지 확인
      const eventTitle = within(targetCell).queryByText('테스트 일정');
      expect(eventTitle).toBeInTheDocument();
    }

    // 8. 이벤트 목록에도 테스트 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('테스트 일정')).toBeInTheDocument();
    expect(within(eventList).getByText(testEvent.date)).toBeInTheDocument();
    expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // 빈 이벤트 배열로 앱 렌더링
    await renderApp([]);

    // Month 뷰로 변경 (기본이 Month 뷰이지만 명시적으로 설정)
    fireEvent.change(screen.getByTestId('view-select'), { target: { value: 'month' } });

    // Month 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 이벤트 목록이 비어있는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 월별 뷰의 모든 셀(day) 확인
    const allDayCells = within(monthView).getAllByRole('cell');

    // 각 셀을 검사하여 이벤트 박스가 없는지 확인
    // 최소 하나의 셀이 있는지 확인
    expect(allDayCells.length).toBeGreaterThan(0);

    // 각 셀에 이벤트 관련 요소가 없는지 확인
    for (const cell of allDayCells) {
      // 날짜 숫자가 아닌 이벤트 박스가 있는지 확인
      // 셀 내용이 숫자만 있고 이벤트 표시가 없어야 함
      const eventBoxes = cell.querySelectorAll('[class*="chakra-box"]');

      // 각 박스를 검사하여 이벤트 제목이 표시되는 박스가 있는지 확인
      let hasEventBox = false;
      eventBoxes.forEach((box) => {
        // 날짜 숫자 표시용 박스가 아닌 추가 이벤트 박스가 있는지 확인
        // 일반적으로 이벤트는 별도의 스타일링된 박스로 표시됨
        if (box.textContent && box.textContent.length > 2) {
          hasEventBox = true;
        }
      });

      // 이벤트 박스가 없어야 함
      expect(hasEventBox).toBe(false);
    }
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // 현재 날짜의 이벤트 생성
    const testEvent = createTodayEvent({
      id: '1',
      title: '월간 테스트 일정',
      description: '월별 뷰 테스트용 일정',
    });

    // 앱 렌더링
    await renderApp([testEvent]);

    // Month 뷰로 변경 (기본이 Month 뷰이지만 명시적으로 설정)
    fireEvent.change(screen.getByTestId('view-select'), { target: { value: 'month' } });

    // Month 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 이벤트 목록에 테스트 일정이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('월간 테스트 일정')).toBeInTheDocument();
    expect(within(eventList).getByText(testEvent.date)).toBeInTheDocument();
    expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();

    // 오늘 날짜의 셀 찾기
    const today = new Date();
    const todayDay = today.getDate();
    const allCells = within(monthView).getAllByRole('cell');

    // 오늘 날짜에 해당하는 셀 찾기
    let todayCell = null;
    for (const cell of allCells) {
      const dateText = within(cell).queryByText(todayDay.toString());
      if (dateText) {
        todayCell = cell;
        break;
      }
    }

    // 오늘 날짜 셀이 존재하는지 확인
    expect(todayCell).not.toBeNull();

    // 오늘 셀에 이벤트가 표시되는지 확인
    if (todayCell) {
      // 이벤트 텍스트가 표시되는지 확인
      // (셀 내부에 '월간 테스트 일정' 텍스트가 있는지)
      const eventText = todayCell.textContent || '';
      expect(eventText.includes('월간 테스트 일정')).toBe(true);
    }
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    await renderApp([]);

    // Month 뷰로 변경
    fireEvent.change(screen.getByTestId('view-select'), { target: { value: 'month' } });

    // Month 뷰가 표시되는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // 날짜 이동을 위한 달력 헤더 버튼들을 찾음
    const prevMonthButton = screen.getByTestId('prev-button');

    // 현재 날짜 확인
    const today = new Date();
    const currentMonth = today.getMonth();

    // 1월까지 뒤로 이동해야 하는 횟수 계산
    // 현재가 1월이면 이동 불필요, 그 외에는 (현재월 - 1)만큼 뒤로 이동
    const clicksNeeded = currentMonth > 0 ? currentMonth : 0;

    // 1월로 이동
    for (let i = 0; i < clicksNeeded; i++) {
      await user.click(prevMonthButton);
    }

    // 헤더에 1월이 표시되는지 확인
    await waitFor(() => {
      const headerText = screen.getByText(/1월/);
      expect(headerText).toBeInTheDocument();
    });

    // 1일을 찾음
    const allCells = within(monthView).getAllByRole('cell');

    // 1일에 해당하는 셀 찾기
    let firstDayCell = null;
    for (const cell of allCells) {
      const dateText = within(cell).queryByText('1');
      if (dateText) {
        firstDayCell = cell;
        break;
      }
    }

    // 1일 셀이 존재하는지 확인
    expect(firstDayCell).not.toBeNull();

    // 1일 셀이 공휴일 스타일로 표시되는지 확인
    if (firstDayCell) {
      // 실제 DOM 구조에 맞게 공휴일 텍스트 확인
      const holidayText = within(firstDayCell).queryByText('신정');
      expect(holidayText).toBeInTheDocument();

      // 셀 내부의 요소 확인
      const dayNumber = within(firstDayCell).getByText('1');
      expect(dayNumber).toBeInTheDocument();
    }
  });
});

describe('검색 기능', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = userEvent.setup();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '팀 회의',
      description: '즐거운 회의',
    });

    await renderApp([todayEvent]);

    // 검색창 찾기
    const searchInput = screen.getByPlaceholderText(/검색/i) || screen.getByLabelText(/검색/i);
    expect(searchInput).toBeInTheDocument();

    // 없는 키워드로 검색
    await user.clear(searchInput);
    await user.type(searchInput, '존재하지 않는 일정');

    // 엔터키 입력 또는 검색 실행
    await user.keyboard('{Enter}');

    // 검색 결과가 없다는 메시지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 기존 '팀 회의' 제목의 이벤트가 보이지 않는지 확인
    expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '팀 회의',
      description: '즐거운 회의',
    });

    await renderApp([todayEvent]);

    // 검색창 찾기
    const searchInput = screen.getByPlaceholderText(/검색/i) || screen.getByLabelText(/검색/i);
    expect(searchInput).toBeInTheDocument();

    // 초기에 팀 회의 이벤트가 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();

    // '팀 회의' 검색어 입력
    await user.clear(searchInput);
    await user.type(searchInput, '팀 회의');

    // 엔터키 입력
    await user.keyboard('{Enter}');

    // 검색 결과에 '팀 회의' 제목의 이벤트가 있는지 확인
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();

    // 이벤트의 세부 정보도 함께 표시되는지 확인
    expect(within(eventList).getByText('즐거운 회의')).toBeInTheDocument();

    // 오늘 날짜가 표시되는지 확인
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`;
    expect(within(eventList).getByText(todayStr)).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '팀 회의',
      description: '즐거운 회의',
    });

    await renderApp([todayEvent]);

    // 검색창 찾기
    const searchInput = screen.getByPlaceholderText(/검색/i) || screen.getByLabelText(/검색/i);
    expect(searchInput).toBeInTheDocument();

    // 먼저 존재하지 않는 검색어로 검색하여 결과가 없는 상태 만들기
    await user.clear(searchInput);
    await user.type(searchInput, '존재하지 않는 일정');
    await user.keyboard('{Enter}');

    // 검색 결과가 없는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 검색어 지우기
    await user.clear(searchInput);
    await user.keyboard('{Enter}');

    // 다시 모든 일정이 표시되는지 확인
    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });

    // 일정의 세부 정보도 확인
    expect(within(eventList).getByText('즐거운 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  let user: UserEvent;

  beforeEach(async () => {
    user = userEvent.setup();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '팀 회의',
      description: '즐거운 회의',
      startTime: '09:00',
      endTime: '10:00',
    });
    await renderApp([todayEvent]);

    // 이미 있는 일정 시간 확인 (todayEvent - 09:00-10:00)
    const eventList = await screen.findByTestId('event-list');
    await within(eventList).findByText('팀 회의');
    expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();

    // 새 일정 추가 시도 (겹치는 시간으로)
    await user.type(screen.getByLabelText(/제목/i), '새 회의');
    await user.type(screen.getByLabelText(/날짜/i), todayEvent.date);

    // 기존 일정과 겹치는 시간 설정 (09:30-10:30)
    await user.type(screen.getByLabelText(/시작 시간/i), '09:30');
    await user.type(screen.getByLabelText(/종료 시간/i), '10:30');

    // 기타 필수 정보 입력
    await user.type(screen.getByLabelText(/설명/i), '새 일정 설명');
    await user.type(screen.getByLabelText(/위치/i), '회의실');
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/카테고리/i), { target: { value: '업무' } });
    });

    // 일정 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 경고 다이얼로그가 표시되는지 확인
    await waitFor(() => {
      // 다이얼로그 헤더 확인
      const dialogHeader = screen.getByText('일정 겹침 경고');
      expect(dialogHeader).toBeInTheDocument();

      // 겹치는 일정 정보 확인
      const eventInfo = screen.getByText((content) => {
        return content.includes('팀 회의') && content.includes(todayEvent.date);
      });
      expect(eventInfo).toBeInTheDocument();
    });

    // 취소 버튼 클릭
    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    // 일정이 추가되지 않았는지 확인
    await waitFor(() => {
      const updatedEventList = screen.getByTestId('event-list');
      expect(within(updatedEventList).queryByText('새 회의')).not.toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const todayEvent = createTodayEvent({
      id: '1',
      title: '팀 회의',
      description: '즐거운 회의',
      startTime: '09:00',
      endTime: '10:00',
    });
    const anotherTodayEvent = createTodayEvent({
      id: '2',
      title: '다른 회의',
      description: '이 회의와 충돌 예정',
      startTime: '11:00',
      endTime: '12:00',
    });

    await renderApp([todayEvent, anotherTodayEvent]);

    // 두 개의 이벤트가 표시되는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('다른 회의')).toBeInTheDocument();

    // 첫 번째 이벤트 편집 시작
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 두 번째 이벤트와 겹치게 시간 변경
    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '11:30');

    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '12:30');

    // 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // AlertDialog 컴포넌트 확인
    await waitFor(() => {
      // 다이얼로그 제목 확인
      const dialogTitle = screen.getByText('일정 겹침 경고');
      expect(dialogTitle).toBeInTheDocument();

      // 겹치는 이벤트 정보 확인
      const conflictingEventInfo = screen.getByText((content) => {
        return content.includes('다른 회의') && content.includes(anotherTodayEvent.date);
      });
      expect(conflictingEventInfo).toBeInTheDocument();
    });

    // 취소 버튼 클릭
    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    // 원래 시간이 변경되지 않았는지 확인
    await waitFor(() => {
      const updatedEventList = screen.getByTestId('event-list');
      expect(within(updatedEventList).getByText('09:00 - 10:00')).toBeInTheDocument();
    });
  });
});

describe('알림 기능', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    // https://github.com/vitest-dev/vitest/issues/3117#issuecomment-1493249764
    (globalThis as any).jest = vi;
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.setSystemTime(new Date('2025-05-15T13:49:00'));

    // 알림을 받을 이벤트 설정 (현재 시간 기준으로 10분 후에 시작하는 이벤트)
    const startTime = '14:00'; // 현재 시간으로부터 10분 후
    const endTime = '15:00';

    const testEvent: Event = {
      id: '1',
      title: '곧 시작하는 회의',
      date: '2025-05-15',
      startTime,
      endTime,
      description: '10분 후 시작하는 테스트 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10, // 10분 전 알림
    };

    await renderApp([testEvent]);

    // 이벤트 목록에서 이벤트 확인
    const eventList = await screen.findByTestId('event-list');
    expect(eventList).toBeInTheDocument();

    // 이벤트 정보가 표시되는지 확인
    await within(eventList).findByText('곧 시작하는 회의');

    // 알림 시간 텍스트 확인 (10분 전)
    const notificationText = within(eventList).getByText('알림: 10분 전');
    expect(notificationText).toBeInTheDocument();

    // 시간을 1초 진행시켜 useInterval에서 checkUpcomingEvents가 호출되도록 함
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });

    // 알림 컴포넌트가 표시되는지 확인
    await waitFor(() => {
      // Alert 컴포넌트 확인
      const notification = screen.getByRole('alert');
      expect(notification).toBeInTheDocument();

      // 알림 내용에 이벤트 제목이 포함되어 있는지 확인
      expect(notification.textContent).toContain('곧 시작하는 회의');
      expect(notification.textContent).toContain('10분 후');
    });
  });
});
