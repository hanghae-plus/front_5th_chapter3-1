import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  let mockEvents = structuredClone(initEvents);

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),

    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      mockEvents.push(newEvent);
      return HttpResponse.json({ success: true }, { status: 201 });
    }),
  ];
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  let mockEvents = structuredClone(initEvents);

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),

    http.put('/api/events/:id', async ({ request, params }) => {
      const id = params.id as string;
      const updatedEvent = (await request.json()) as Event;

      const eventIndex = mockEvents.findIndex((event) => event.id === id);
      if (eventIndex === -1) {
        return HttpResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
      }

      mockEvents[eventIndex] = { ...updatedEvent, id };
      return HttpResponse.json({ success: true }, { status: 200 });
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  let mockEvents = structuredClone(initEvents);

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const eventIndex = mockEvents.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        return HttpResponse.json({ success: false, message: 'Event Not Found' }, { status: 404 });
      }

      const deletedEvent = mockEvents.find((event) => event.id === id);
      mockEvents.splice(eventIndex, 1);
      return HttpResponse.json({ success: true, event: deletedEvent }, { status: 200 });
    }),
  ];
};
