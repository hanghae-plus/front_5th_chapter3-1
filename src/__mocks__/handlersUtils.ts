import { http, HttpResponse } from 'msw';
import { Event } from '../types';
import { server } from '../setupTests';

export const createMockHandlers = (initEvents: Event[] = []) => {
  // 클로저로 테스트 독립 상태 유지
  let mockEvents = [...initEvents];

  return [
    // 전체 이벤트 목록 조회
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    // 이벤트 생성
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = `${mockEvents.length + 1}`;
      mockEvents = [...mockEvents, newEvent];
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    // 이벤트 수정
    http.put('/api/events/:id', async ({ params, request }) => {
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === params.id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockEvents = mockEvents.map((event) => (event.id === params.id ? updatedEvent : event));

      return HttpResponse.json(updatedEvent, { status: 200 });
    }),

    // 이벤트 삭제
    http.delete('/api/events/:id', ({ params }) => {
      const index = mockEvents.findIndex((event) => event.id === params.id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockEvents = mockEvents.filter((event) => event.id !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
};

/**
 * server.use()로 현재 테스트에만 적용되는 핸들러를 등록
 */
export const setupMockHandlers = (initEvents: Event[] = []) => {
  server.use(...createMockHandlers(initEvents));
};

// 의미별 alias
export const setupMockHandlerCreation = setupMockHandlers;
export const setupMockHandlerUpdating = setupMockHandlers;
export const setupMockHandlerDeletion = setupMockHandlers;
