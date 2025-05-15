import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    const newEventId = (events.length + 1).toString();
    events.push({ ...newEvent, id: newEventId });
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const newEvent = (await request.json()) as Event;
    const putIndex = events.findIndex((event) => event.id === params.id);
    if (putIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const deleteIndex = events.findIndex((event) => event.id === params.id);
    if (deleteIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    events.splice(deleteIndex, 1);
    return HttpResponse.json(null, { status: 204 });
  }),
];
