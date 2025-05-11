import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor, fireEvent } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { Event } from '../types';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

const createCurrentMonthEvent = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-based index이므로 +1
  const currentDay = currentDate.getDate();

  const newEvent = {
    title: '테스트 일정',
    date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트 일정 설명',
  };

  return newEvent;
};

const addOrUpdateEvent = async (
  user: ReturnType<typeof userEvent.setup>,
  event: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }
) => {
  const titleInput = screen.getByLabelText(/제목/i);
  const dateInput = screen.getByLabelText(/날짜/i);
  const startTimeInput = screen.getByLabelText(/시작 시간/i);
  const endTimeInput = screen.getByLabelText(/종료 시간/i);
  const descriptionInput = screen.getByLabelText(/설명/i);

  // 생성 시에는 input이 비어있으므로 바로 type
  // 수정 시에는 테스트 코드에서 fireEvent.change 등으로 값을 비운 뒤 type

  await user.type(titleInput, event.title);
  await user.type(dateInput, event.date);
  await user.type(startTimeInput, event.startTime);
  await user.type(endTimeInput, event.endTime);
  await user.type(descriptionInput, event.description);

  const saveButton = screen.getByTestId('event-submit-button');
  await user.click(saveButton);
};

describe('일정 CRUD 및 기본 기능', () => {
  it('새로운 일정을 등록하면 캘릭더와 일정 목록에서 확인할 수 있다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const user = userEvent.setup();

    renderApp();

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    await waitFor(() => {
      // 캘린더 뷰에서 확인
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getByText(NEW_EVENT.title)).toBeInTheDocument();

      // 이벤트 리스트에서 확인
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText(NEW_EVENT.title)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();

    renderApp();

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    const editButton = screen.getByTestId('edit-event-button-2');

    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/제목/i)).toHaveValue('테스트 일정');
    });

    const UPDATED_EVENT = {
      ...NEW_EVENT,
      id: '2',
      title: '수정된 일정',
      description: '수정된 일정 설명',
    };

    // 각 input을 직접 비우고 type으로 입력
    const titleInput = screen.getByLabelText(/제목/i);
    const dateInput = screen.getByLabelText(/날짜/i);
    const startTimeInput = screen.getByLabelText(/시작 시간/i);
    const endTimeInput = screen.getByLabelText(/종료 시간/i);
    const descriptionInput = screen.getByLabelText(/설명/i);

    fireEvent.change(titleInput, { target: { value: '' } });
    await user.type(titleInput, UPDATED_EVENT.title);

    fireEvent.change(dateInput, { target: { value: '' } });
    await user.type(dateInput, UPDATED_EVENT.date);

    fireEvent.change(startTimeInput, { target: { value: '' } });
    await user.type(startTimeInput, UPDATED_EVENT.startTime);

    fireEvent.change(endTimeInput, { target: { value: '' } });
    await user.type(endTimeInput, UPDATED_EVENT.endTime);

    fireEvent.change(descriptionInput, { target: { value: '' } });
    await user.type(descriptionInput, UPDATED_EVENT.description);

    const saveButton = screen.getByTestId('event-submit-button');
    await user.click(saveButton);

    await waitFor(() => {
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getByText(UPDATED_EVENT.title)).toBeInTheDocument();

      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText(UPDATED_EVENT.title)).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();

    renderApp();

    const NEW_EVENT = createCurrentMonthEvent();

    await addOrUpdateEvent(user, NEW_EVENT);

    const deleteButton = screen.getByTestId('delete-event-button-2');
    await user.click(deleteButton);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).queryByText(NEW_EVENT.title)).not.toBeInTheDocument();
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
