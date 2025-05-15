import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
  // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
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
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '회의',
      date: '2025-11-01',
      startTime: '10:30',
      endTime: '12:00',
      description: '디자인 리뷰',
      location: '1층 대회의실',
      category: '업무',
    });

    const events = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(events).getByText('회의')).toBeInTheDocument();
      expect(within(events).getByText('2025-11-01')).toBeInTheDocument();
      expect(within(events).getByText('10:30 - 12:00')).toBeInTheDocument();
      expect(within(events).getByText('디자인 리뷰')).toBeInTheDocument();
      expect(within(events).getByText('1층 대회의실')).toBeInTheDocument();
      expect(within(events).getByText('카테고리: 업무')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);
    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '디자인 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '와이어프레임 논의 및 피드백');
    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '1층 디자인실');

    await user.click(screen.getByTestId('event-submit-button'));

    const events = within(screen.getByTestId('event-list'));

    expect(events.getByText('디자인 회의')).toBeInTheDocument();
    expect(events.getByText('와이어프레임 논의 및 피드백')).toBeInTheDocument();
    expect(events.getByText('1층 디자인실')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('삭제할 이벤트')).toBeInTheDocument();

    await user.click(await screen.findByLabelText('Delete event'));

    expect(events.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);

    const view = await screen.findByLabelText('view');

    await user.selectOptions(view, 'week');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '간단한 회의',
      date: '2025-10-02',
      startTime: '13:00',
      endTime: '14:00',
      description: '회의',
      location: '회의실',
      category: '업무',
    });

    const view = await screen.findByLabelText('view');

    await user.selectOptions(view, 'week');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('간단한 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const { user } = setup(<App />);

    await user.click(await screen.findByLabelText('Next'));

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '간단한 회의',
      date: '2025-10-02',
      startTime: '13:00',
      endTime: '14:00',
      description: '회의',
      location: '회의실',
      category: '업무',
    });

    const monthView = within(await screen.findByTestId('month-view'));
    expect(monthView.getByText('간단한 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = await screen.findByTestId('month-view');
    const janFirst = within(monthView).getByText('1').parentElement as HTMLElement;
    expect(within(janFirst).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기획 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '신제품 아이디어 논의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '개발 회의',
        date: '2025-10-15',
        startTime: '11:30',
        endTime: '13:00',
        description: '이전 기획건에 대한 개발 논의',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 5,
      },
    ]);
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchBox = await screen.findByLabelText('일정 검색');
    await user.click(searchBox);
    await user.clear(searchBox);
    await user.type(searchBox, '존재하지 않는 일정');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'기획 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchBox = await screen.findByLabelText('일정 검색');
    await user.click(searchBox);
    await user.clear(searchBox);
    await user.type(searchBox, '기획 회의');

    const events = within(await screen.findByTestId('event-list'));

    expect(events.getByText('기획 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchBox = await screen.findByLabelText('일정 검색');
    await user.click(searchBox);
    await user.clear(searchBox);
    await user.type(searchBox, '존재하지 않는 일정');

    const events = within(await screen.findByTestId('event-list'));
    expect(events.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.clear(searchBox);

    expect(events.getByText('기획 회의')).toBeInTheDocument();
    expect(events.getByText('개발 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '마케팅 전략 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '캠페인 방향 논의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '고객 발표 준비',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '12:00',
      description: '자료 정리 및 리허설',
      location: '회의실 B',
      category: '업무',
    });

    const warningDialog = within(await screen.findByRole('alertdialog'));

    expect(warningDialog.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(
      warningDialog.getByText('마케팅 전략 회의 (2025-10-15 09:00-10:00)')
    ).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '마케팅 전략 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '캠페인 방향 논의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '브레인스토밍 세션',
        date: '2025-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '초기 아이디어 모음',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '고객 발표 준비');
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 일정');

    await user.click(screen.getByTestId('event-submit-button'));

    const warningDialog = within(await screen.findByRole('alertdialog'));

    expect(warningDialog.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(
      warningDialog.getByText('마케팅 전략 회의 (2025-10-15 09:00-10:00)')
    ).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15T08:49:00'));

  setup(<App />);

  await screen.findByText('일정 로딩 완료!');

  act(() => {
    vi.advanceTimersByTime(1000 * 60);
  });

  expect(await screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
