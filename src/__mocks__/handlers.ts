import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

const allEvents: Map<string, Event> = new Map();

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    const combinedEvents = [...events, ...Array.from(allEvents.values())];
    return HttpResponse.json(combinedEvents);
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;

    if (!newEvent) {
      return new HttpResponse(null, { status: 400 });
    }

    allEvents.set(newEvent.id, newEvent);

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;

    if (!id) {
      return new HttpResponse(null, { status: 400 });
    }

    const updatedEvent = (await request.json()) as Event;
    const existingEvent = allEvents.get(id as string);

    if (!existingEvent) {
      return new HttpResponse(null, { status: 404 });
    }

    allEvents.set(id as string, { ...existingEvent, ...updatedEvent });
    return HttpResponse.json(allEvents.get(id as string));
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    if (!id) {
      return new HttpResponse(null, { status: 400 });
    }

    const deletedEvent = allEvents.get(id as string);

    if (!deletedEvent) {
      return new HttpResponse(null, { status: 404 });
    }

    allEvents.delete(id as string);

    return HttpResponse.json(deletedEvent);
  }),
];
