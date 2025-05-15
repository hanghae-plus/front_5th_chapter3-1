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
import {expect} from "vitest";

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
  it('새 일정 등록: 제목, 날짜, 시간, 설명, 위치, 카테고리 등 모든 필드가 정확히 저장되고 표시된다', async () => {
  //   MSW 핸들러 설정 - API 응답을 모킹하여 빈 이벤트 배열로 시작
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);

    const eventData = {
      title: '테스트 회의',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무'
    };

  //   act로 폼 제출 및 상태 업데이트 래핑
    await act(async () => {
      await saveSchedule(user, eventData);
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      const titleElement = within(eventList).queryByText(eventData.title);
      expect(titleElement).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(within(eventList).getByText(eventData.date)).toBeInTheDocument();
    expect(within(eventList).getByText(`${eventData.startTime} - ${eventData.endTime}`)).toBeInTheDocument();
    expect(within(eventList).getByText(eventData.description)).toBeInTheDocument();
    expect(within(eventList).getByText(eventData.location)).toBeInTheDocument();
    expect(within(eventList).getByText(`카테고리: ${eventData.category}`)).toBeInTheDocument();

  });

  it('일정 수정: 기존 일정의 제목과 설명을 변경하면 UI에 즉시 반영되고 저장된다', async () => {});

  it('일정 삭제: 삭제 버튼 클릭 시 해당 일정이 목록에서 사라지고 삭제 메시지가 표시된다', async () => {});
});

describe('일정 뷰', () => {
  it('주간 뷰 - 빈 일정: 주별 뷰로 전환 후 해당 주에 일정이 없으면 캘린더에 일정이 표시되지 않는다', async () => {});

  it('주간 뷰 - 일정 표시: 주별 뷰에서 해당 주에 일정이 있으면 올바른 날짜 셀에 일정이 표시된다', async () => {});

  it('월간 뷰 - 빈 일정: 월별 뷰로 전환 후 해당 월에 일정이 없으면 캘린더에 일정이 표시되지 않는다', async () => {});

  it('월간 뷰 - 일정 표시: 월별 뷰에서 해당 월에 일정이 있으면 올바른 날짜 셀에 일정이 표시된다', async () => {});

  it('공휴일 표시: 1월로 이동 시 1월 1일(신정)이 공휴일로 표시되고 빨간색으로 강조된다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과 없음: 존재하지 않는 키워드 검색 시 "검색 결과가 없습니다" 메시지가 표시된다', async () => {});

  it("검색 결과 필터링: \"팀 회의\" 키워드로 검색 시 해당 키워드가 포함된 일정만 필터링되어 표시된다", async () => {});

  it('검색 초기화: 검색어를 모두 지우면 필터링이 해제되고 모든 일정이 다시 표시된다', async () => {});
});

describe('일정 충돌', () => {
  it('일정 충돌 감지 - 신규 등록: 기존 일정과 시간이 겹치는 새 일정 추가 시 경고 다이얼로그가 표시된다', async () => {});

  it('일정 충돌 감지 - 수정: 기존 일정의 시간을 변경하여 다른 일정과 충돌 발생 시 경고 다이얼로그가 표시된다', async () => {});
});

it('알림 기능: 일정 시작 10분 전 도달 시 설정된 알림 메시지가 화면에 표시된다', async () => {});
