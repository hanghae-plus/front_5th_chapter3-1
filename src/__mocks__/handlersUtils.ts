import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import type { Event } from '../types';

interface FindByIdParams {
  id: string;
}

// 어떻게 해야할지 모르겠어서 여기는 배꼈습니다 .. medium에 잘나와있네요 .. ㅎ
export const setupMockHandlerCreation = (initEvents: Event[] = [], logging = false) => {
  const mockEvents = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      if (logging) {
        console.group('🚀 GET /api/events ( setupMockHandlerCreation )');
        console.log('🚀 events >> ', mockEvents);
        console.groupEnd();
      }

      return HttpResponse.json({ events: mockEvents });
    }),
    http.post<{}, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);

      if (logging) {
        console.group('🚀 POST /api/events ( setupMockHandlerCreation ) ');
        console.log('🚀 newEvent >> ', newEvent);
        console.groupEnd();
      }

      return HttpResponse.json(newEvent, { status: 201 });
    }),
    http.put<FindByIdParams, Event>('/api/events/:id', async ({ request, params }) => {
      const updatedEvent = await request.json();
      const updatedEventId = params.id;

      if (logging) {
        console.group('🚀 PUT /api/events/:id ( setupMockHandlerCreation )');
        console.log('🚀 params >> ', params);
        console.log('🚀 body >> ', updatedEvent);
        console.groupEnd();
      }

      const exEventIndex = mockEvents.findIndex((event) => event.id === updatedEventId);
      if (exEventIndex === -1) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      mockEvents[exEventIndex] = updatedEvent;

      return HttpResponse.json({
        events: mockEvents,
      });
    }),
    http.delete<FindByIdParams, Event>('/api/events/:id', async ({ params }) => {
      const deletedEventId = params.id;

      if (logging) {
        console.group('🚀 DELETE /api/events/:id ( setupMockHandlerCreation )');
        console.log('🚀 params >> ', params);
        console.groupEnd();
      }

      const exEventIndex = mockEvents.findIndex((event) => event.id === deletedEventId);
      if (exEventIndex === -1) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      mockEvents.splice(exEventIndex, 1);

      return HttpResponse.json({
        events: mockEvents,
      });
    })
  );
};

export const setupMockHandlerUpdating = () => {};

export const setupMockHandlerDeletion = () => {};
