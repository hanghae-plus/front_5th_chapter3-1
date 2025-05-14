import { ChakraProvider } from '@chakra-ui/react';
import {
  render,
  screen,
  within,
  act,
  renderHook,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { useSearch } from '../hooks/useSearch';
import { server } from '../setupTests';
import { Event } from '../types';
import { mockTestDataList } from './data/mockTestData';
import { handlers } from '../__mocks__/handlers';
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';

//TODO: useFakeTimer로 날짜 고정
const weekStart = new Date('2025-05-02'); // 이 날이 속한 주: 6/29~7/5
const monthDate = new Date('2025-05-01'); // 7월 전체

describe('일정 CRUD 및 기본 기능', () => {
  const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
  beforeEach(() => {
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');

    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(dateInput, { target: { value: '2025-05-30' } });
    fireEvent.change(startTimeInput, { target: { value: '21:00' } });
    fireEvent.change(endTimeInput, { target: { value: '22:00' } });
    fireEvent.change(descriptionInput, { target: { value: '테스트 설명' } });
    fireEvent.change(locationInput, { target: { value: '테스트 위치' } });

    const addButton = screen.getByTestId('event-submit-button');
    fireEvent.click(addButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('Test Event')).toBeInTheDocument();
      expect(within(eventList).getByText('2025-05-30')).toBeInTheDocument();
      expect(within(eventList).getByText('21:00 - 22:00')).toBeInTheDocument();
      expect(within(eventList).getByText('테스트 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('테스트 위치')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { handlers } = setupMockHandlerUpdating(mockTestDataList as Event[]);
    server.use(...handlers);
    // 테스트 중에 event.id 가 '3' 이라고 가정
    const eventId = mockTestDataList[2].id;

    // 1) 해당 이벤트 박스 컨테이너를 가져온다
    const eventBox = await screen.findByTestId(`event-${eventId}`);
    // 2) within 으로 scope 를 좁히고 edit button 클릭
    const { getByRole } = within(eventBox);
    const editButton = getByRole('button', { name: 'Edit event' });
    fireEvent.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const descriptionInput = screen.getByLabelText('설명');

    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    const submitButton = screen.getByTestId('event-submit-button');
    fireEvent.click(submitButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('Test Event')).toBeInTheDocument();
      expect(within(eventList).getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const { handlers } = setupMockHandlerDeletion(mockTestDataList as Event[]);
    server.use(...handlers);

    // 테스트 중에 event.id 가 '3' 이라고 가정
    const eventId = mockTestDataList[2].id;

    // 1) 해당 이벤트 박스 컨테이너를 가져온다
    const eventBox = await screen.findByTestId(`event-${eventId}`);

    // 2) within 으로 scope 를 좁힌다
    const { getByRole } = within(eventBox);

    const deleteButton = getByRole('button', { name: 'Delete event' });
    fireEvent.click(deleteButton);

    const eventList = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).queryByText('팀 회의')).not.toBeInTheDocument();
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
  const { handlers } = setupMockHandlerCreation(mockTestDataList as Event[]);
  beforeEach(() => {
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '트랄라' } });

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');

    fireEvent.change(searchInput, { target: { value: mockTestDataList[2].title } });

    const searchedEvent = await screen.findByTestId('event-list');

    await waitFor(() => {
      expect(within(searchedEvent).getByText(mockTestDataList[2].title)).toBeInTheDocument();
      expect(within(searchedEvent).getByText(mockTestDataList[2].location)).toBeInTheDocument();
      expect(within(searchedEvent).getByText(mockTestDataList[2].description)).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: mockTestDataList[2].title } });

    fireEvent.change(searchInput, { target: { value: '' } });

    const searchedEvent = await screen.findByTestId('event-list');

    // mockTestDataList 에 들어있는 각 제목이 모두 있는지 순회 검증
    mockTestDataList.forEach((event) => {
      expect(within(searchedEvent).getByText(event.title)).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
