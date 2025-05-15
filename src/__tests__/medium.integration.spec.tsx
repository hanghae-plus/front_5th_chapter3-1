import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

type EventFormData = Omit<Event, 'id' | 'notificationTime' | 'repeat'>;

const saveSchedule = async (user: UserEvent, form: EventFormData) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);

  // 카테고리 선택
  const categorySelect = screen.getByLabelText('카테고리');
  await user.selectOptions(categorySelect, category);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    const newEvent: EventFormData = {
      title: '새로운 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    // 저장 완료 메시지 대기
    await screen.findByText('일정이 추가되었습니다.');

    const eventList = screen.getByTestId('event-list');
    const eventDetails = within(eventList);

    expect(eventDetails.getByText(newEvent.title)).toBeInTheDocument();
    expect(eventDetails.getByText(newEvent.date)).toBeInTheDocument();
    expect(
      eventDetails.getByText(`${newEvent.startTime} - ${newEvent.endTime}`)
    ).toBeInTheDocument();
    expect(eventDetails.getByText(newEvent.description)).toBeInTheDocument();
    expect(eventDetails.getByText(newEvent.location)).toBeInTheDocument();
    expect(eventDetails.getByText(`카테고리: ${newEvent.category}`)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    //이벤트 리스트 -> 수정하고자 하는 일정의 수정 버튼 클릭
    const eventList = screen.getByTestId('event-list');
    const eventDetails = within(eventList);
    const eventItem = eventDetails.getByTestId('event-1');
    const eventItemDetails = within(eventItem);
    const editButton = eventItemDetails.getByTestId('edit-event-1');

    await user.click(editButton);

    //수정 폼에 해당 일정의 정보가 정확히 표시되는지 확인
    expect(screen.getByLabelText('제목')).toHaveValue('기존 회의');
    expect(screen.getByLabelText('날짜')).toHaveValue('2025-10-15');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');
    expect(screen.getByLabelText('설명')).toHaveValue('기존 팀 미팅');

    const updatedEvent: EventFormData = {
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, updatedEvent);
    const updatedEventItem = eventDetails.getByTestId('event-1');
    const updatedEventItemDetails = within(updatedEventItem);
    expect(updatedEventItemDetails.getByText(updatedEvent.title)).toBeInTheDocument();
    expect(updatedEventItemDetails.getByText(updatedEvent.date)).toBeInTheDocument();
    expect(
      updatedEventItemDetails.getByText(`${updatedEvent.startTime} - ${updatedEvent.endTime}`)
    ).toBeInTheDocument();
    expect(updatedEventItemDetails.getByText(updatedEvent.description)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    // 초기 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    //이벤트 리스트 -> 수정하고자 하는 일정의 수정 버튼 클릭
    const eventList = screen.getByTestId('event-list');
    const eventDetails = within(eventList);
    const eventItem = eventDetails.getByTestId('event-1');
    const eventItemDetails = within(eventItem);
    const deleteButton = eventItemDetails.getByTestId('delete-event-1');

    await user.click(deleteButton);

    expect(eventDetails.queryByTestId('event-1')).not.toBeInTheDocument();
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
