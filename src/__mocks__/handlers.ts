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
    const event = (await request.json()) as Event;
    const lastId = Number(events[events.length - 1].id);

    event.id = String(lastId + 1);

    return HttpResponse.json(event, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const event = (await request.json()) as Event;
    const { id } = params;
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events[index] = { ...events[index], ...event };

    return HttpResponse.json(events[index], { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events.splice(index, 1);

    return HttpResponse.json({ message: 'Event deleted' }, { status: 200 });
  }),
];
