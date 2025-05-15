import { ChakraProvider, extendTheme } from '@chakra-ui/react';
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
import { Event, EventForm } from '../types';
import { events } from '../__mocks__/response/realEvents.json';

const mockEvents = events as Event[];

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
    vi.setSystemTime(new Date('2025-05-01'));
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    const newEvent: EventForm = {
      title: '신규 회의',
      date: '2025-05-20',
      startTime: '15:00',
      endTime: '16:00',
      description: '신규 팀 미팅',
      location: '회의실 E',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    };

    await saveSchedule(user, newEvent);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByLabelText(newEvent.title)).toBeInTheDocument();
      expect(within(eventList).getByLabelText(newEvent.description)).toBeInTheDocument();
      expect(within(eventList).getByLabelText(newEvent.location)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const updatedEvent = { ...mockEvents[0], title: '수정된 일정' };

    setupMockHandlerUpdating([...mockEvents, updatedEvent]);

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();

    const editButton = await within(eventList).findByTestId(
      `edit-event-button-${mockEvents[0].id}`
    );
    await user.click(editButton);

    const title = await screen.findByLabelText('제목');
    await user.clear(title);
    await user.type(title, '수정된 일정');

    const submitButton = await screen.findByTestId('event-submit-button');
    await user.click(submitButton);

    const updatedEventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(updatedEventList).getByLabelText('수정된 일정')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion(mockEvents);

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText(mockEvents[0].title)).toBeInTheDocument();

    const deleteButton = await within(eventList).findByTestId(
      `delete-event-button-${mockEvents[0].id}`
    );
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(mockEvents[0].title)).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

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
