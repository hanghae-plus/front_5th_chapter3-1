import { http, HttpResponse } from 'msw';

import type { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

interface FindByIdParams {
  id: string;
}

export const handlers = [
  http.get('/api/events', () => {
    console.group('🚀 GET /api/events');
    console.log('🚀 events >> ', events);
    console.groupEnd();

    return HttpResponse.json({ events });
  }),
  http.post<{}, Event>('/api/events', async ({ request }) => {
    const newEvent = await request.json();

    console.group('🚀 POST /api/events');
    console.log('🚀 body >> ', newEvent);
    console.groupEnd();

    return HttpResponse.json({
      events: [...events, newEvent],
    });
  }),

  http.put<FindByIdParams, Event>('/api/events/:id', async ({ request, params }) => {
    const updatedEvent = await request.json();
    const updatedEventId = params.id;

    console.group('🚀 PUT /api/events/:id');
    console.log('🚀 params >> ', params);
    console.log('🚀 body >> ', updatedEvent);
    console.groupEnd();

    const exEvent = events.find((event) => event.id === params.id);
    if (!exEvent) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvents = events.map((event) =>
      event.id === updatedEventId ? updatedEvent : event
    );

    return HttpResponse.json({
      events: updatedEvents,
    });
  }),

  http.delete<FindByIdParams>('/api/events/:id', ({ params }) => {
    const deletedEventId = params.id;

    console.group('🚀 DELETE /api/events/:id');
    console.log('🚀 params >> ', params);
    console.groupEnd();

    return HttpResponse.json({ id: deletedEventId });
  }),
];
