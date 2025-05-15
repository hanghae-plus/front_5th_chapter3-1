// import { render, screen, within, act } from '@testing-library/react';
// import { http, HttpResponse } from 'msw';
// import { ReactElement } from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { setupMockHandlerCreation, setupMockHandlerUpdating } from '../__mocks__/handlersUtils';
import eventJson from '../__mocks__/response/realEvents.json';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// import { server } from '../setupTests';
// import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-05-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const { handlers } = setupMockHandlerCreation();
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.

    // 1. 사용자 입력 시뮬레이션
    await userEvent.type(screen.getByLabelText(/제목/), '테스트 일정');
    await userEvent.type(screen.getByLabelText(/날짜/), '2025-05-15');
    await userEvent.type(screen.getByLabelText(/시작 시간/), '10:00');
    await userEvent.type(screen.getByLabelText(/종료 시간/), '11:00');
    await userEvent.type(screen.getByLabelText(/설명/), '통합 테스트 설명');
    await userEvent.type(screen.getByLabelText(/위치/), '회의실 B');

    // 2. 저장 버튼 클릭
    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    // 3. 리스트에서 추가된 일정 확인
    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList!).getByText('회의실 B')).toBeInTheDocument();
    expect(within(eventList!).getByText('통합 테스트 설명')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { handlers } = setupMockHandlerUpdating(eventJson.events as Event[]);
    server.use(...handlers);

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {});
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
