import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerAppend,
  setupMockHandlerDeletion,
  setupMockHandlerFetch,
  setupMockHandlerUpdateById,
} from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

export const handlers = [
  http.get('/api/events', () => {
    const currentEvents = setupMockHandlerFetch();

    return HttpResponse.json({ events: currentEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    const newEvent = { ...event, id: String(events.length + 1) };

    setupMockHandlerAppend(newEvent);

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const update = (await request.json()) as Event;

    const currentEvents = setupMockHandlerFetch();
    const updatedEvent = currentEvents.map(
      (event): Event =>
        Number(event.id) === Number(id) ? ({ ...event, ...update } as Event) : (event as Event)
    );

    setupMockHandlerUpdateById(updatedEvent);

    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id as string;
    const currentEvents = setupMockHandlerFetch();
    const filteredEvents = currentEvents.filter((event) => Number(event.id) !== Number(id));

    setupMockHandlerDeletion(id);

    return HttpResponse.json(filteredEvents);
  }),
];
