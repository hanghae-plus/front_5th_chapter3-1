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

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

setupMockHandlerCreation(events as Event[]);

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: setupMockHandlerFetch() });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    return HttpResponse.json(setupMockHandlerAppend(event));
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const update = (await request.json()) as Event;
    return HttpResponse.json(setupMockHandlerUpdateById({ ...update, id }));
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id as string;
    return HttpResponse.json(setupMockHandlerDeletion(id));
  }),
];
