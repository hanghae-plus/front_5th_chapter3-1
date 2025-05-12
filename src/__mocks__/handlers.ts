import { randomUUID } from 'crypto';

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
    newEvent.id = randomUUID();
    return HttpResponse.json({ ...events, newEvent }, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params; //params로 동적 경로 (:id) 값 추출
    const eventIndex = events.findIndex((event) => event.id === id);
    const updatedEvent = (await request.json()) as Event;
    if (eventIndex > -1) {
      return HttpResponse.json({ ...events[eventIndex], ...updatedEvent });
    } else {
      return new HttpResponse(null, { status: 404 });
    }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const newEvents = events.filter((event) => event.id !== id);
    return HttpResponse.json({ newEvents }, { status: 204 });
  }),
];
