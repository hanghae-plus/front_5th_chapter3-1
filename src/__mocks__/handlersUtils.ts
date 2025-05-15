import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const result = await request.json();
      console.log('result', result);
      const newEvent = result as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = (mockEvents = [] as Event[]) => {
  // mockEvent를 여기서 선언하고 수정하게되면, 어느것을 수정하든 계속 해당 선언이벤트만 수정하는 결과를 낳게됨.
  // mockEvent를 직접 props로 받아서 수정하게해야한다.
  const updateEvents: Event[] = [...mockEvents];
  server.use(
    http.get('/api/events', () => {

      return HttpResponse.json({ events: [updateEvents[1]] });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      console.log("UPDATE")
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);
      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = (mockEvents: Event[]) => {

  const deleteEvents = mockEvents.splice(0, 1);
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: deleteEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
