import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { createMockHandlersUtils } from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export function createHandlers(utils: ReturnType<typeof createMockHandlersUtils>) {
  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: utils.setupMockHandlerFetch() });
    }),
    http.post('/api/events', async ({ request }) => {
      const event = (await request.json()) as Event;
      const newEvent = { ...event, id: String(utils.setupMockHandlerFetch().length + 1) };
      utils.setupMockHandlerAppend(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
    http.put('/api/events/:id', async ({ request, params }) => {
      const id = params.id as string;
      const update = (await request.json()) as Event;
      const currentEvents = utils.setupMockHandlerFetch();
      const updatedEvent = currentEvents.map((event) =>
        event.id === id ? { ...event, ...update } : event
      );
      utils.setupMockHandlerUpdateById(updatedEvent);
      return HttpResponse.json(updatedEvent);
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const id = params.id as string;
      utils.setupMockHandlerDeletion(id);
      return HttpResponse.json(utils.setupMockHandlerFetch());
    }),
  ];
}
