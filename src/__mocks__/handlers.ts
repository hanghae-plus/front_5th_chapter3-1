import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = `${events.length + 1}`;
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const modifiedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === params.id);
    return index !== -1
      ? HttpResponse.json(modifiedEvent, { status: 201 })
      : new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const index = events.findIndex((events) => events.id === params.id);
    return index !== -1
      ? new HttpResponse(null, { status: 204 })
      : new HttpResponse(null, { status: 404 });
  }),
];
