import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils.ts';
import allEventDataFromFile from '../__tests__/dummy/dummyMockEvents.json' assert { type: 'json' };
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const eventsForTest = allEventDataFromFile.events as Event[];

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {});
  afterEach(() => {});
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();
    // 기존 이벤트와 겹치지 않는 고유 ID 생성
    const uniqueId = `test-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEvent = {
      id: uniqueId,
      title: '새로운 이벤트',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '15:00',
      description: '새로운 이벤트 설명',
      location: '새로운 이벤트 장소',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
    };

    // MSW 핸들러 직접 설정 - 응답에 새 이벤트 포함
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [...eventsForTest, newEvent] });
      }),
      http.post('/api/events', async () => {
        return HttpResponse.json(newEvent, { status: 201 });
      })
    );
    renderApp();

    await user.type(screen.getByLabelText('제목'), newEvent.title);
    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), newEvent.date);
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await user.type(screen.getByLabelText('설명'), newEvent.description);
    await user.type(screen.getByLabelText('위치'), newEvent.location);
    await user.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);
    await user.selectOptions(
      screen.getByLabelText('알림 설정'),
      newEvent.notificationTime.toString()
    );
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
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
