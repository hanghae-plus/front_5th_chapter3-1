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
    const eventData = (await request.json()) as Event;
    return HttpResponse.json({
      event: { id: events.length + 1, ...(eventData as Record<string, any>) },
    });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    if (!id) {
      return new HttpResponse(null, { status: 404 });
    }
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) new HttpResponse(null, { status: 404 });

    return HttpResponse.json({ ...events[index], ...updatedEvent });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    if (!id) {
      return new HttpResponse(null, { status: 404 });
    }
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) new HttpResponse(null, { status: 404 });

    return new HttpResponse(null, { status: 204 });
  }),
];
