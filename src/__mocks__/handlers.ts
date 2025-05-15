import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerAppend,
  setupMockHandlerDeletion,
  setupMockHandlerFetch,
  setupMockHandlerUpdating,
} from './handlersUtils';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    // events.json의 데이터가 setupMockHandlerCreation에서 이미 초기화되었으므로,
    // setupMockHandlerFetch를 호출하면 현재 테스트의 events.json 기반 데이터를 반환
    return HttpResponse.json({ events: setupMockHandlerFetch() });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    // ID 생성 방식 개선 - 고유한 ID 생성
    const newEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    // 디버깅 로그 제거 필요
    setupMockHandlerAppend(newEvent);
    return HttpResponse.json(newEvent);
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const update = (await request.json()) as Event;

    // 현재 이벤트 스토어 가져오기
    const currentEvents = setupMockHandlerFetch();

    // 특정 이벤트만 업데이트
    const updatedEvents = currentEvents.map((event) =>
      event.id === id ? { ...event, ...update } : event
    );

    // 이벤트 스토어 업데이트
    setupMockHandlerUpdating(updatedEvents);

    // 업데이트된 이벤트 찾기
    const updatedEvent = updatedEvents.find((event) => event.id === id);

    // 업데이트된 이벤트 반환
    return HttpResponse.json(updatedEvent || update);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id as string;
    setupMockHandlerDeletion(id);
    // 삭제 후 204 상태 코드 반환
    return new HttpResponse(null, { status: 204 });
  }),
];
