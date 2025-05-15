import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';
// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const createMockHandlers = (initEvents = [] as Event[]) => {
  let events = [...initEvents];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: events }, { status: 200 });
    }),

    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      const newEventId = (events.length + 1).toString();
      events.push({ ...newEvent, id: newEventId });
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const putEvent = (await request.json()) as Event;

      events = events.map((event) => (event.id === putEvent.id ? putEvent : event));

      const index = events.findIndex((event) => event.id === params.id);

      return index !== -1
        ? HttpResponse.json(putEvent, { status: 201 })
        : new HttpResponse(null, { status: 404 });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const deleteIndex = events.findIndex((event) => event.id === params.id);

      events = events.filter((event) => event.id !== params.id);

      if (deleteIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }
      return new HttpResponse(null, { status: 204 });
    }),
  ];
};

export const setupMockHandlers = (initEvents: Event[] = []) => {
  server.use(...createMockHandlers(initEvents));
};
