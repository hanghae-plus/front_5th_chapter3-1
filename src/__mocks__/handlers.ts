import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerFetch,
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
  setupMockHandlerAdding,
} from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
setupMockHandlerCreation(events as Event[]);

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({
      events: setupMockHandlerFetch(),
    });
  }),

  http.post('/api/events', async ({ request }) => {
    const { ...rest } = (await request.json()) as Event;
    const newEvent = { ...rest, id: String(events.length + 1) };

    setupMockHandlerAdding([newEvent]);
    return HttpResponse.json({
      events: [...events, newEvent],
    });
  }),

  http.put('/api/events/:id', async ({ request }) => {
    const { id, ...rest } = (await request.json()) as Event;
    const updateEvents = events.map((event) => (event.id === id ? { ...event, ...rest } : event));

    setupMockHandlerUpdating(id, rest as Event);
    return HttpResponse.json({
      events: updateEvents,
    });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params as { id: string };
    const deletedEvents = events.filter((event) => event.id !== id) as Event[];

    setupMockHandlerDeletion(id);
    return HttpResponse.json({
      events: deletedEvents,
    });
  }),
];
