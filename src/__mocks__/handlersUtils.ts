import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  // 내부 메모리 상태: 각 테스트마다 고유하게 사용할 수 있도록 클로저로 events 유지
  let events = [...initEvents];

  const handlers = [
    /** GET */
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    /** POST */
    http.post('/api/events', async ({ request }) => {
      const { event } = (await request.json()) as { event: Event };
      events.push(event);
      return HttpResponse.json({ event });
    }),
  ];

  return { handlers, getEvents: () => events };
};

export const setupMockHandlerUpdating = (initEvents: Event[] = []) => {
  let events = [...initEvents];

  const handlers = [
    /** PUT */
    http.put('/api/events/:id', async ({ request, params }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((e) => e.id === id);
      if (index !== -1) {
        events[index] = updatedEvent;
        return HttpResponse.json({ success: true });
      }
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }),
  ];

  return { handlers, getEvents: () => events };
};
export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  let events = [...initEvents];

  const handlers = [
    /** DELETE */
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = events.findIndex((e) => e.id === id);
      if (index !== -1) {
        events.splice(index, 1);
      }
      return HttpResponse.json({ success: true });
    }),
  ];

  return { handlers, getEvents: () => events };
};
