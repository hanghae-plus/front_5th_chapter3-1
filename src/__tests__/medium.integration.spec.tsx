import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';

import { server } from '../setupTests';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  const events = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-05-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 1 설명',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-05-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 2 설명',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // 1. 테스트를 위한 사용자 이벤트 설정
    const user = userEvent.setup();
    console.log('user', user);

    // 최초 데이터 설정
    setupMockHandlerCreation(events as Event[]);

    // 2. 컴포넌트 렌더링
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 4. 폼 필드에 데이터 입력
    await user.type(screen.getByLabelText('제목'), '신규 프로젝트 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-06-20');
    await user.type(screen.getByLabelText('시작 시간'), '14:00');
    await user.type(screen.getByLabelText('종료 시간'), '15:00');
    await user.type(screen.getByLabelText('설명'), '프로젝트 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 5. select 옵션 선택
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');
    await user.selectOptions(screen.getByLabelText('알림 설정'), '10');

    // 6. 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // 저장된 일정 데이터 확인
    const eventList = screen.getByTestId('event-list');

    // 디버깅을 위한 로그 추가
    console.log('Event List HTML:', eventList.innerHTML);

    await waitFor(() => {
      expect(within(eventList).getByText('신규 프로젝트 회의')).toBeInTheDocument();
    });

    // 7. 저장된 일정 데이터 확인
    // 방법 1: data-testid를 사용하여 확인
    // const eventList = screen.getByTestId('event-list');

    // // 각 필드별로 텍스트 확인
    // expect(within(eventList).getByText('신규 프로젝트 회의')).toBeInTheDocument();
    // expect(within(eventList).getByText('2024-01-20')).toBeInTheDocument();
    // expect(within(eventList).getByText('14:00 - 15:00')).toBeInTheDocument();
    // expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
    // expect(within(eventList).getByText(/업무/)).toBeInTheDocument();

    // // 8. 성공 토스트 메시지 확인
    // expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {});

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
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    // 1. 환경
    await render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 2. 검색어 입력
    await userEvent.type(screen.getByPlaceholderText('검색어를 입력하세요'), '검색어'); // find by id

    // 3. 검색 결과 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
