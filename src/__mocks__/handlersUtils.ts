import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';
import { sharedEvents } from './sharedEvents';

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1); // 간단한 ID 생성
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  sharedEvents.length = 0; // sharedEvents 초기화
  sharedEvents.push(...initEvents);

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: sharedEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = sharedEvents.findIndex((event) => event.id === id);

      sharedEvents[index] = { ...sharedEvents[index], ...updatedEvent };
      return HttpResponse.json(sharedEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  sharedEvents.length = 0; // sharedEvents 초기화
  sharedEvents.push(...initEvents);

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: sharedEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = sharedEvents.findIndex((event) => event.id === id);

      sharedEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );
};
