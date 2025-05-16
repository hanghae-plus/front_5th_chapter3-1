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
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // App 렌더링 -> 새 일정 입력 -> 일정 추가 클릭 -> 입력값 입력 -> 저장 -> 결과
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    const form = {
      title: '팀 회의',
      date: '2025-10-05',
      startTime: '09:00',
      endTime: '10:00',
      description: '프로젝트 논의',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, form);

    // 일정 보기
    const eventList = await screen.findByTestId('event-list');
    const created = within(eventList).getByText(form.title);

    expect(created).toBeInTheDocument();

    // 내가 입력한 값이 잘 있나
    expect(screen.getByText(form.date)).toBeInTheDocument();
    expect(screen.getByText(`${form.startTime} - ${form.endTime}`)).toBeInTheDocument();
    expect(screen.getByText(form.description)).toBeInTheDocument();
    expect(screen.getByText(form.location)).toBeInTheDocument();
    expect(screen.getByText(`카테고리: ${form.category}`)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // 이미 일정이 있음 -> 수정 클릭 -> 입력값 변경 -> 일정 수정 클릭 -> 수정 내용 반영 확인
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 기존 일정 '기존 회의'가 먼저 나타나야 함
    const list = await screen.findByTestId('event-list');
    const existingEvent = within(list).getByText('기존 회의');
    expect(existingEvent).toBeInTheDocument();

    // 수정 버튼 클릭
    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 기존 값이 입력 필드에 채워져 있어야 함
    const titleInput = screen.getByLabelText('제목');
    expect(titleInput).toHaveValue('기존 회의');

    // 수정 - 제목 변경, 종료 시간 변경, 설명 추가
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:00');

    const descInput = screen.getByLabelText('설명');
    await user.clear(descInput);
    await user.type(descInput, '회의 설명 변경');

    await user.click(screen.getByTestId('event-submit-button')); // 수정 버튼

    // 업데이트된 리스트에서 반영된 내용 확인
    const all = await screen.findAllByText('수정된 회의');
    expect(all.length).toBeGreaterThan(0);

    expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('회의 설명 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // 이벤트들이 렌더링 -> 휴지통 아이콘 클릭 -> 삭제 -> 이벤트 리스트에서 그 제목이 안 보여야 함
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const list = await screen.findByTestId('event-list');
    const target = within(list).getByText('삭제할 이벤트');

    expect(target).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 삭제 후 해당 텍스트가 더 이상 없어야 함
    await waitFor(() => {
      expect(screen.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 주간 뷰 선택
    const select = screen.getByLabelText('view');
    await user.selectOptions(select, 'week');

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 뷰 전환
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    // navigate → navigate (10/15 포함 주간으로 이동)
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));

    // 리스트 로딩
    const list = await screen.findByTestId('event-list');

    // 요소 검증
    expect(within(list).getAllByText((text) => text.includes('기존 회의'))).toHaveLength(2);
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation(); // 일정 없음

    const { user } = setup(<App />);

    const select = screen.getByLabelText('view');
    await user.selectOptions(select, 'month');

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerUpdating(); // 10월 일정 2개

    const { user } = setup(<App />);

    await screen.findAllByText('기존 회의');

    const select = screen.getByLabelText('view');
    await user.selectOptions(select, 'month');

    const list = await screen.findByTestId('event-list');
    expect(within(list).getByText('기존 회의')).toBeInTheDocument();
    expect(within(list).getByText('기존 회의2')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation(); // 이벤트 없어도 OK

    const { user } = setup(<App />);

    const select = screen.getByLabelText('view');
    await user.selectOptions(select, 'month');

    // navigate로 2025년 1월로 이동
    await user.click(screen.getByLabelText('Previous')); // 9월
    await user.click(screen.getByLabelText('Previous')); // 8월
    await user.click(screen.getByLabelText('Previous')); // 7월
    await user.click(screen.getByLabelText('Previous')); // 6월
    await user.click(screen.getByLabelText('Previous')); // 5월
    await user.click(screen.getByLabelText('Previous')); // 4월
    await user.click(screen.getByLabelText('Previous')); // 3월
    await user.click(screen.getByLabelText('Previous')); // 2월
    await user.click(screen.getByLabelText('Previous')); // 1월

    // "신정"이라는 공휴일 텍스트가 달력에 표시되어야 함
    const calendar = await screen.findByTestId('month-view');
    expect(within(calendar).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // 기존의 일정들 렌더링 -> 입력창에 없는 검색어 입력 -> 결과 없다는 메시지가 화면에 나타나야 함
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 이벤트가 리스트에 렌더링되길 기다림
    await screen.findAllByText('기존 회의');

    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(input, '없는 검색어');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 일정이 렌더링되길 기다림
    await screen.findAllByText('기존 회의');

    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(input, '기존 회의2');

    const matches = await screen.findAllByText('기존 회의2');
    expect(matches).toHaveLength(2);
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    await screen.findAllByText('기존 회의');
    const input = screen.getByPlaceholderText('검색어를 입력하세요');

    await user.type(input, '기존 회의2');
    expect(await screen.findAllByText('기존 회의2')).toHaveLength(2);
    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();

    // 검색어 삭제
    await user.clear(input);

    // 모든 일정 다시 보이기
    expect(await screen.findAllByText('기존 회의')).toHaveLength(2);
    expect(screen.getAllByText('기존 회의2')).toHaveLength(2);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 초기 이벤트 로딩
    await screen.findAllByText('기존 회의');

    const form = {
      title: '겹치는 일정',
      date: '2025-10-15',
      startTime: '09:30', // 기존 회의와 겹침
      endTime: '10:30',
      location: '회의실 A',
      description: '충돌 테스트',
      category: '업무',
    };

    await saveSchedule(user, form);

    // 알림 다이얼로그 등장 확인
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/겹칩니다/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    // 기존 회의 수정 버튼 클릭
    const list = await screen.findByTestId('event-list');
    const editButtons = within(list).getAllByLabelText('Edit event');
    await user.click(editButtons[0]); // id: 1 (09:00–10:00)

    // 시간을 기존 회의2와 겹치게 변경 (11:00–12:00)
    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    await user.clear(startInput);
    await user.type(startInput, '11:00');

    await user.clear(endInput);
    await user.type(endInput, '12:00');

    await user.click(screen.getByTestId('event-submit-button'));

    // 겹침 경고 다이얼로그 확인
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/겹칩니다/)).toBeInTheDocument();

    // 계속 진행 클릭
    await user.click(within(dialog).getByText('계속 진행'));

    // 수정된 이벤트가 리스트에 반영되어야 함
    expect(await screen.findAllByText('기존 회의')).toHaveLength(2);
    expect(screen.getAllByText('11:00 - 12:00')).toHaveLength(2);
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-01T09:00:00'));
  setupMockHandlerCreation();

  const { user } = setup(<App />);

  // 현재 시간은 2025-10-01T09:00
  const form = {
    title: '회의 알림 테스트',
    date: '2025-10-01',
    startTime: '09:10', // 10분 뒤
    endTime: '10:00',
    location: '회의실 A',
    description: '알림 테스트 설명',
    category: '업무',
  };

  await saveSchedule(user, form);

  // 1초마다 알림 확인 로직이 실행되므로 타이머를 진행시킴
  await act(() => {
    vi.advanceTimersByTime(1000);
  });

  const alert = await screen.findByRole('alert');
  const message = within(alert).getByText((text) =>
    text.includes('10분 후 회의 알림 테스트 일정이 시작됩니다')
  );
  expect(message).toBeInTheDocument();
});
