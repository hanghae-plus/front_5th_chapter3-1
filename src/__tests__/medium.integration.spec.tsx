import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { vi } from 'vitest';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

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
  if (description) await user.type(screen.getByLabelText('설명'), description);
  if (location) await user.type(screen.getByLabelText('위치'), location);

  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.click(screen.getByTestId('event-submit-button'));
};

beforeAll(() => server.listen());
afterAll(() => server.close());

beforeEach(async (ctx) => {
  vi.useRealTimers();
  server.resetHandlers();

  const testName = ctx.task.name;

  if (testName.includes('입력한 새로운 일정')) {
    setupMockHandlerCreation();
  }
  if (testName.includes('기존 일정의 세부 정보를 수정')) {
    setupMockHandlerUpdating();
  }
  if (testName.includes('일정을 삭제')) {
    setupMockHandlerDeletion();
  }
  if (testName.includes('기존 일정의 시간을 수정')) {
    setupMockHandlerUpdating();
  }
});


// === 일정 CRUD ===
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    server.use(
      http.post('/api/events', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(body, { status: 201 });
      })
    );
    const { user } = setup(<App />);

    const newEvent = {
      title: '팀 회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '점검 회의',
      location: 'A 회의실',
      category: '업무',
    };
    await saveSchedule(user, newEvent);
    const eventItem = await screen.findByTestId('event-item');
    expect(within(eventItem).getByText('팀 회의')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating(); // 추가됨
    const { user } = setup(<App />);
  
    const item = await screen.findByText('기존 회의');
    const container = item.closest('[data-testid="event-item"]') as HTMLElement;
    await user.click(within(container).getByLabelText('수정'));
  
    const titleInput = await screen.findByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');
    await user.click(screen.getByTestId('event-submit-button'));
    expect(await screen.findByText('수정된 회의')).toBeInTheDocument();
  });
  

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const item = await screen.findByText('삭제할 이벤트');
    const container = item.closest('[data-testid="event-item"]') as HTMLElement;
    await user.click(within(container).getByLabelText('삭제'));
    await user.click(await screen.findByText('확인'));

    await waitFor(() => {
      expect(screen.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
    });
  });
});

// === 뷰 테스트 ===
describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    const { user } = setup(<App />);
    await user.click(screen.getByText('주별'));
    expect(screen.queryByTestId('event-item')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재하면 일정이 정확히 표시된다', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({
      events: [{
        id: '1', title: '주간 회의', date: '2025-05-21',
        startTime: '09:00', endTime: '10:00',
        description: '', location: '', category: '업무',
        repeat: { type: 'none', interval: 0 }, notificationTime: 5
      }]
    })));
    const { user } = setup(<App />);
    await user.click(screen.getByText('주별'));
    expect(await screen.findByText('주간 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    const { user } = setup(<App />);
    await user.click(screen.getByText('월별'));
    expect(screen.queryByTestId('event-item')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({
      events: [{
        id: '1', title: '월간 회의', date: '2025-05-15',
        startTime: '10:00', endTime: '11:00',
        description: '', location: '', category: '업무',
        repeat: { type: 'none', interval: 0 }, notificationTime: 5
      }]
    })));
    const { user } = setup(<App />);
    await user.click(screen.getByText('월별'));
    expect(await screen.findByText('월간 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);
    await user.click(screen.getByText('월별'));
    const cell = screen.getByText('1').closest('div');
    expect(cell).toHaveClass('holiday');
  });
});

// === 검색 ===
describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
    const { user } = setup(<App />);
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '없는 일정');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({
      events: [{
        id: '1', title: '팀 회의', date: '2025-05-22',
        startTime: '10:00', endTime: '11:00',
        description: '', location: '', category: '업무',
        repeat: { type: 'none', interval: 0 }, notificationTime: 5
      }]
    })));
    const { user } = setup(<App />);
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const events = [
      { id: '1', title: '팀 회의', date: '2025-05-22', startTime: '10:00', endTime: '11:00', category: '업무', description: '', location: '', repeat: { type: 'none', interval: 0 }, notificationTime: 5 },
      { id: '2', title: '점심 약속', date: '2025-05-22', startTime: '12:00', endTime: '13:00', category: '개인', description: '', location: '', repeat: { type: 'none', interval: 0 }, notificationTime: 5 }
    ];
    server.use(http.get('/api/events', () => HttpResponse.json({ events })));
    const { user } = setup(<App />);
    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '팀 회의');
    await user.keyboard('{Enter}');
    await user.clear(screen.getByPlaceholderText('검색어를 입력하세요'));
    await user.keyboard('{Enter}');
    expect(await screen.findByText('점심 약속')).toBeInTheDocument();
  });
});

// === 충돌 검사 ===
describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({
      events: [{
        id: '1', title: '기존 회의', date: '2025-05-23',
        startTime: '10:00', endTime: '11:00',
        category: '업무', repeat: { type: 'none', interval: 0 }, notificationTime: 5
      }]
    })));
    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '충돌 회의', date: '2025-05-23',
      startTime: '10:30', endTime: '11:30',
      description: '충돌 테스트트', location: '', category: '업무'
    });
    expect(await screen.findByText(/일정이 겹칩니다/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating(); // 추가됨
    const { user } = setup(<App />);
  
    const item = await screen.findByText('기존 회의');
    const container = item.closest('[data-testid="event-item"]') as HTMLElement;
    await user.click(within(container).getByLabelText('수정'));
  
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '10:30');
    await user.click(screen.getByTestId('event-submit-button'));
    expect(await screen.findByText(/일정이 겹칩니다/)).toBeInTheDocument();
  });
});

// === 알림 ===
it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const mockEvent = {
    id: '1', title: '알림 테스트', date: '2025-05-24',
    startTime: '10:00', endTime: '11:00',
    category: '업무', description: '', location: '',
    repeat: { type: 'none', interval: 0 }, notificationTime: 10
  };

  server.use(http.get('/api/events', () => HttpResponse.json({ events: [mockEvent] })));

  vi.useRealTimers(); // 중복 방지용
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-05-24T09:50:00'));

  setup(<App />);
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(await screen.findByText(/10분 후 알림 테스트 일정이 시작됩니다/)).toBeInTheDocument();
  vi.useRealTimers();
});

describe('추가 기능 테스트', () => {
  it('카테고리별 필터링이 정상적으로 동작하는지 확인한다', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({
      events: [
        {
          id: '1', title: '업무 회의', date: '2025-05-22',
          startTime: '10:00', endTime: '11:00',
          description: '', location: '',
          category: '업무', repeat: { type: 'none', interval: 0 }, notificationTime: 5
        },
        {
          id: '2', title: '가족 모임', date: '2025-05-22',
          startTime: '18:00', endTime: '20:00',
          description: '', location: '',
          category: '개인', repeat: { type: 'none', interval: 0 }, notificationTime: 5
        }
      ]
    })));

    const { user } = setup(<App />);
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    await waitFor(() => {
      expect(screen.getByText('업무 회의')).toBeInTheDocument();
      expect(screen.queryByText('가족 모임')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('일정 상세 정보가 모달에서 정확하게 표시되는지 확인한다', async () => {
    server.use(http.get('/api/events', () => HttpResponse.json({
      events: [{
        id: '1',
        title: '프로젝트 미팅',
        date: '2025-05-23',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 진행 상황 점검',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10
      }]
    })));

    const { user } = setup(<App />);
    await waitFor(() => {
      expect(screen.getByText('프로젝트 미팅')).toBeInTheDocument();
    });

    const eventItem = screen.getByText('프로젝트 미팅');
    await user.click(eventItem);

    expect(await screen.findByText('프로젝트 진행 상황 점검')).toBeInTheDocument();
    expect(await screen.findByText('회의실 A')).toBeInTheDocument();
    expect(await screen.findByText('2025-05-23')).toBeInTheDocument();
  });
});