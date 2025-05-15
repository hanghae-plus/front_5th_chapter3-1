import { Event } from '../types';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const createHandlers = (initEvents: Event[] = []) => {
  let mockEvents = [...initEvents];

  return [
    // GET /api/events
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),

    // POST /api/events
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = `${mockEvents.length + 1}`;
      mockEvents = [...mockEvents, newEvent];
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    // PUT /api/events/:id
    http.put('/api/events/:id', async ({ params, request }) => {
      const modifiedEvent = (await request.json()) as Event;

      mockEvents = mockEvents.map((event) =>
        event.id === modifiedEvent.id ? modifiedEvent : event
      );

      const index = mockEvents.findIndex((event) => event.id === params.id);

      return index !== -1
        ? HttpResponse.json(modifiedEvent, { status: 201 })
        : new HttpResponse(null, { status: 404 });
    }),

    // DELETE /api/events/:id
    http.delete('/api/events/:id', ({ params }) => {
      const index = mockEvents.findIndex((event) => event.id === params.id);

      mockEvents = mockEvents.filter((event) => event.id !== params.id);

      return index !== -1
        ? new HttpResponse(null, { status: 204 })
        : new HttpResponse(null, { status: 404 });
    }),
  ];
};

export const setupMockHandlers = (initEvents: Event[] = []) => {
  server.use(...createHandlers(initEvents));
};

export const setupMockHandlerCreation = setupMockHandlers;
export const setupMockHandlerUpdating = setupMockHandlers;
export const setupMockHandlerDeletion = setupMockHandlers;
