import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
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
    // Given
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);

    const MOCK_EVENT = {
      title: '스터디 준비',
      date: '2025-10-06',
      startTime: '14:00',
      endTime: '16:30',
      description: '스터디 발표 자료 정리',
      location: '카페 24',
      category: '업무',
    };

    // When
    await saveSchedule(user, MOCK_EVENT);

    // Then
    expect(screen.getAllByText('일정 추가')[0]).toBeInTheDocument();
    expect(screen.getByText(MOCK_EVENT.date)).toBeInTheDocument();
    expect(screen.getByText(`${MOCK_EVENT.startTime} - ${MOCK_EVENT.endTime}`)).toBeInTheDocument();
    expect(screen.getByText(MOCK_EVENT.description)).toBeInTheDocument();
    expect(screen.getByText(MOCK_EVENT.location)).toBeInTheDocument();
    expect(screen.getByText(MOCK_EVENT.category)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // Given
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    // When
    const updatedTitle = '새벽 일정';
    const updatedLocation = '스터디룸 B';

    const titleInput = await screen.findByLabelText('제목');
    const locationInput = await screen.getByLabelText('위치');
    await user.clear(titleInput);
    await user.type(titleInput, updatedTitle);
    await user.clear(locationInput);
    await user.type(locationInput, updatedLocation);

    await user.click(screen.getByTestId('event-submit-button'));

    // Then
    const eventList = await screen.findByTestId('event-list');
    const updated = within(eventList);
    expect(updated.getByText(updatedTitle)).toBeInTheDocument();
    expect(updated.getByText(updatedLocation)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // Given
    setupMockHandlerDeletion();
    const { user } = setup(<App />);
    const deletedTitle = '새벽 일정';

    // When
    const deleteBtn = await screen.findByLabelText('Delete event');
    await user.click(deleteBtn);

    const confirmBtn = screen.queryByRole('button', { name: /확인|삭제/i });
    if (confirmBtn) {
      await user.click(confirmBtn);
    }

    // Then
    await waitFor(() => {
      expect(screen.queryByText(deletedTitle)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // Given
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // When
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // Given
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-11-12',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    vi.setSystemTime(new Date('2025-11-10')); // 월요일
    const { user } = setup(<App />);

    // When
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('주간 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // Given
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-11-12',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    vi.setSystemTime(new Date('2025-11-10')); // 월요일
    const { user } = setup(<App />);

    // When
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('주간 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // Given
    setupMockHandlerCreation([
      {
        id: '1',
        title: '월간 회의',
        date: '2025-11-15',
        startTime: '13:00',
        endTime: '14:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    vi.setSystemTime(new Date('2025-11-01'));
    const { user } = setup(<App />);

    // When
    await user.selectOptions(screen.getByLabelText('view'), 'month');

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('월간 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // Given
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    // When
    const monthView = await screen.findByTestId('month-view');

    // Then
    const janFirstCell = within(monthView).getByText('1').closest('div')!;
    expect(within(janFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // Given
    setupMockHandlerCreation([]);
    setup(<App />);

    // When
    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    await userEvent.type(input, '존재하지 않는 일정');

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    // Given
    setupMockHandlerCreation([
      {
        id: '1',
        title: '팀 회의',
        date: '2025-10-30',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    const { user } = setup(<App />);

    // When
    const input = await screen.findByLabelText('일정 검색');
    await user.clear(input);
    await user.type(input, '팀 회의');

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    // Given
    setupMockHandlerCreation([
      {
        id: '1',
        title: '검색 테스트 일정',
        date: '2025-10-30',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
    const { user } = setup(<App />);

    // When
    const input = await screen.findByLabelText('일정 검색');
    await user.type(input, '없는 키워드');
    await user.clear(input);

    // Then
    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('검색 테스트 일정')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // Given
    setupMockHandlerCreation([
      {
        id: '1123',
        title: '팀 회의',
        date: '2025-10-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
    const { user } = setup(<App />);
    const overlappingEvent = {
      title: '중복 일정',
      date: '2025-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '리더 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    // When
    await saveSchedule(user, overlappingEvent);

    // Then
    const warningAlert = await screen.findByRole('alertdialog');
    expect(warningAlert).toHaveTextContent('일정 겹침 경고');
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // Given
    setupMockHandlerUpdating();
    const { user } = setup(<App />);
    const eventList = await screen.findByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-card');

    // When
    const editButton = within(eventItems[1]).getByLabelText('Edit event');
    await user.click(editButton);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '09:30');

    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    // Then
    const warningAlert = await screen.findByRole('alertdialog');
    expect(warningAlert).toHaveTextContent('일정 겹침 경고');
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // Given
  vi.setSystemTime(new Date('2025-10-15T08:40:00'));

  setup(<App />);

  await screen.findByText('일정 로딩 완료!');

  // When
  act(() => {
    vi.advanceTimersByTime(1000 * 60 * 10);
  });

  // Then
  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
