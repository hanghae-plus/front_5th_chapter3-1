import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerAppend,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerFetch,
  setupMockHandlerUpdateById,
} from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

setupMockHandlerCreation(events as Event[]);

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: setupMockHandlerFetch() });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    const newEvent = { ...event, id: String(events.length + 1) };
    setupMockHandlerAppend(newEvent);
    return HttpResponse.json(newEvent);
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const update = (await request.json()) as Event;

    const updatedEvent = events.map(
      (event): Event =>
        Number(event.id) === Number(id) ? ({ ...event, ...update } as Event) : (event as Event)
    );
    setupMockHandlerUpdateById(updatedEvent);
    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id as string;
    const filteredEvents = events.filter((event) => Number(event.id) !== Number(id));
    setupMockHandlerDeletion(id);
    return HttpResponse.json(filteredEvents);
  }),
];
