import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const events: Event[] = [...initEvents];

  return [
    http.get('/api/events', () => HttpResponse.json({ events })),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      events.push({ ...newEvent, id: String(events.length + 1) });
      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  const events: Event[] = [...initEvents];
  return [
    http.get('/api/events', () => HttpResponse.json({ events })),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      }

      return new HttpResponse(null, { status: 404 });
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  const events: Event[] = [...initEvents];
  return [
    http.get('/api/events', () => HttpResponse.json({ events })),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }

      return new HttpResponse(null, { status: 404 });
    }),
  ];
};
