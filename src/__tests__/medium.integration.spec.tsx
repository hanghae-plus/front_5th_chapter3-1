import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // 오늘 날짜로 맞추기
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const newEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: todayStr,
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 각 입력 필드에 값 입력
    await userEvent.type(screen.getByLabelText('제목'), newEvent.title);
    await userEvent.type(screen.getByLabelText('날짜'), newEvent.date);
    await userEvent.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await userEvent.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await userEvent.type(screen.getByLabelText('설명'), newEvent.description);
    await userEvent.type(screen.getByLabelText('위치'), newEvent.location);
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);
    await userEvent.selectOptions(
      screen.getByLabelText('알림 설정'),
      String(newEvent.notificationTime)
    );

    await userEvent.click(screen.getByTestId('event-submit-button'));
    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('테스트 일정')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 1. 초기 데이터 세팅
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 2. 월별 뷰로 전환
    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');

    // 3. 검색어가 비어있는지 확인
    expect(screen.getByLabelText('일정 검색')).toHaveValue('');

    // 4. 기존 일정이 리스트에 보이는지 확인
    const eventList = screen.getByTestId('event-list');

    expect(
      await within(eventList).findByText((content) => content.includes('기존 회의'))
    ).toBeInTheDocument();

    // 5. 수정 버튼 클릭 (aria-label="Edit event" 사용)
    await userEvent.click(within(eventList).getByRole('button', { name: /edit/i }));

    // 6. 입력값 변경
    const newTitle = '수정된 회의';
    const newDesc = '수정된 설명';
    await userEvent.clear(screen.getByLabelText('제목'));
    await userEvent.type(screen.getByLabelText('제목'), newTitle);
    await userEvent.clear(screen.getByLabelText('설명'));
    await userEvent.type(screen.getByLabelText('설명'), newDesc);

    // 7. 저장 버튼 클릭
    await userEvent.click(screen.getByTestId('event-submit-button'));

    // 8. 리스트에 수정된 값이 반영됐는지 확인
    expect(
      await within(eventList).findByText((content) => content.includes(newTitle))
    ).toBeInTheDocument();
    expect(within(eventList).getByText(newDesc)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    const eventList = await screen.findByTestId('event-list');

    // 일정이 존재하는지 확인
    expect(
      await within(eventList).findByText((content) => content.includes('기존 회의'))
    ).toBeInTheDocument();

    await userEvent.click(within(eventList).getByRole('button', { name: /delete event/i }));

    expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 일정이 삭제되었는지 확인
    expect(
      await within(eventList).queryByText((content) => content.includes('기존 회의'))
    ).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await userEvent.selectOptions(screen.getByLabelText('view'), 'week');

    // 다음주 선택
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    // 일정이 없는지 확인
    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await userEvent.selectOptions(screen.getByLabelText('view'), 'week');

    // 해당 일자에 일정이 존재하는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(
      await within(eventList).findByText((content) => content.includes('기존 회의'))
    ).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');

    // 다음월 선택
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');

    // 해당 월에 일정이 존재하는지 확인
    const eventList = await screen.findByTestId('event-list');
    expect(
      await within(eventList).findByText((content) => content.includes('기존 회의'))
    ).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 월별 뷰로 전환
    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');

    // 1월이 보일 때까지 'Previous' 버튼 클릭 (최대 24번)
    let maxTries = 24;
    while (!screen.queryByText(/\d{4}년 1월/) && maxTries-- > 0) {
      await userEvent.click(screen.getByRole('button', { name: /previous/i }));
    }

    // 1월 1일 셀에서 '신정' 텍스트가 있는지 확인
    const monthView = await screen.findByTestId('month-view');
    expect(await within(monthView).findByText(/신정/)).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // 1. "팀 회의" 일정 포함 데이터로 초기화
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      // 필요하다면 다른 일정도 추가
    ]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 2. 월별 뷰로 전환
    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');

    // 3. 검색어 입력
    await userEvent.type(screen.getByLabelText('일정 검색'), '팀 회의');

    // 4. 리스트에서 "팀 회의"가 보이는지 검증
    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList as HTMLElement).findByText('팀 회의')).toBeInTheDocument();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');
    // 검색어를 일부러 존재하지 않는 값으로 입력
    await userEvent.type(screen.getByLabelText('일정 검색'), '없는 일정');

    // 비동기 렌더링을 안전하게 처리
    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // 1. "팀 회의" 일정 포함 데이터로 초기화
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      // 필요하다면 다른 일정도 추가
    ]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 2. 월별 뷰로 전환
    await userEvent.selectOptions(screen.getByLabelText('view'), 'month');

    // 3. 검색어 입력
    await userEvent.type(screen.getByLabelText('일정 검색'), '팀 회의');

    // 4. 리스트에서 "팀 회의"가 보이는지 검증
    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList as HTMLElement).findByText('팀 회의')).toBeInTheDocument();

    // 5. 검색어를 지우면 모든 일정이 다시 표시되어야 한다
    await userEvent.clear(screen.getByLabelText('일정 검색'));

    // 다시 나타나는지 기다림
    expect(await within(eventList as HTMLElement).findByText('팀 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // 1. 기존 일정 추가 (14:00~15:00)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: todayStr,
        startTime: '14:00',
        endTime: '15:00',
        description: '기존 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 2. 겹치는 새 일정 입력 (14:30~15:30)
    await userEvent.type(screen.getByLabelText('제목'), '겹치는 일정');
    await userEvent.type(screen.getByLabelText('날짜'), todayStr);
    await userEvent.type(screen.getByLabelText('시작 시간'), '14:30');
    await userEvent.type(screen.getByLabelText('종료 시간'), '15:30');
    await userEvent.type(screen.getByLabelText('설명'), '겹치는 설명');
    await userEvent.type(screen.getByLabelText('위치'), '회의실 B');
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), '업무');
    await userEvent.selectOptions(screen.getByLabelText('알림 설정'), '10');

    await userEvent.click(screen.getByTestId('event-submit-button'));

    // 3. 경고 다이얼로그가 뜨는지 확인
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('다음 일정과 겹칩니다'))
    ).toBeInTheDocument();
    // 기존 일정 정보가 노출되는지 (함수 매처로 변경)
    const eventInfo = `기존 회의 (${todayStr} 14:00-15:00)`;
    expect(screen.getByText((content) => content.includes(eventInfo))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '계속 진행' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // 1. 기존 일정 2개 준비: A(14:00~15:00), B(15:30~16:00)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setupMockHandlerCreation([
      {
        id: 'A',
        title: '기존 회의 A',
        date: todayStr,
        startTime: '14:00',
        endTime: '15:00',
        description: 'A 설명',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: 'B',
        title: '기존 회의 B',
        date: todayStr,
        startTime: '15:30',
        endTime: '16:00',
        description: 'B 설명',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 2. eventList에서 모든 일정 카드(Box)를 찾고, "기존 회의 B"가 포함된 카드에서만 수정 버튼 클릭
    const eventList = await screen.findByTestId('event-list');
    const allBoxes = eventList.querySelectorAll('div[role="group"], div'); // Box가 div일 확률이 높음
    let editButton: HTMLElement | null = null;
    for (const box of Array.from(allBoxes)) {
      const htmlBox = box as HTMLElement;
      if (htmlBox.textContent && htmlBox.textContent.includes('기존 회의 B')) {
        editButton = within(htmlBox).getByRole('button', { name: /edit/i });
        break;
      }
    }
    expect(editButton).not.toBeNull();
    await userEvent.click(editButton!);

    // 3. 시작시간을 14:30으로 변경(겹치게)
    await userEvent.clear(screen.getByLabelText('시작 시간'));
    await userEvent.type(screen.getByLabelText('시작 시간'), '14:30');
    // 저장
    await userEvent.click(screen.getByTestId('event-submit-button'));

    // 4. 경고 다이얼로그 확인
    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('다음 일정과 겹칩니다'))
    ).toBeInTheDocument();
    const eventInfo = `기존 회의 A (${todayStr} 14:00-15:00)`;
    expect(screen.getByText((content) => content.includes(eventInfo))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '계속 진행' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  setupMockHandlerCreation([
    {
      id: '1',
      title: '팀 회의',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );

  const eventList = await screen.findByTestId('event-list');
  expect(await within(eventList as HTMLElement).findByText('팀 회의')).toBeInTheDocument();

  // 실제 UI는 '알림: 10분 전' 형태로 표시함
  expect(await within(eventList as HTMLElement).findByText(/알림: 10분 전/)).toBeInTheDocument();
});
