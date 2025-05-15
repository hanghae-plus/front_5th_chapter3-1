import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  let mockEvents = [...initEvents];

  return [
    http.get('/api/events', () => {
      console.log('🟢 [MSW] GET /api/events called');
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),

    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      console.log('🟢 [MSW] POST /api/events called with:', newEvent);
      mockEvents.push(newEvent);
      return HttpResponse.json({ success: true }, { status: 201 });
    }),
  ];
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  let mockEvents = [...initEvents];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),

    http.put('/api/events/:id', async ({ request }) => {
      const updatedEvent = (await request.json()) as Event;
      const hasEvent = mockEvents.some((event) => event.id === updatedEvent.id);
      if (!hasEvent) {
        return HttpResponse.json({ success: false }, { status: 404 });
      }
      mockEvents = mockEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
      return HttpResponse.json({ success: true }, { status: 200 });
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  let mockEvents = [...initEvents];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      mockEvents = mockEvents.filter((event) => event.id !== id);
      return HttpResponse.json({ success: true }, { status: 200 });
    }),
  ];
};
