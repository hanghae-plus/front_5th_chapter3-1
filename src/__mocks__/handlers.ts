import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerAppend,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerFetch,
  setupMockHandlerUpdate,
} from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

setupMockHandlerCreation(events as Event[]);

export const handlers = [
  http.get('/api/events', () => {
    const prevEvents = setupMockHandlerFetch();
    return HttpResponse.json({ events: prevEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    const newEvent = { ...event, id: String(events.length + 1) };

    setupMockHandlerAppend(newEvent);
    const prevEvents = setupMockHandlerFetch();
    return HttpResponse.json({
      events: [...prevEvents, newEvent],
    });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const update = (await request.json()) as Partial<Event>;

    setupMockHandlerUpdate(id, update);

    const prevEvents = setupMockHandlerFetch();
    const updatedEvents = prevEvents.map((event) =>
      event.id === id ? { ...event, ...update } : event
    );

    return HttpResponse.json({
      events: updatedEvents,
    });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id as string;
    setupMockHandlerDeletion(id);

    const prevEvents = setupMockHandlerFetch();
    const filteredEvents = prevEvents.filter((event) => event.id !== id);

    return HttpResponse.json({
      events: filteredEvents,
    });
  }),
];
