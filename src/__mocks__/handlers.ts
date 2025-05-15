import { http, HttpResponse } from 'msw';

import eventsData from './response/events.json';
import { Event } from '../entities/event/model/types';

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

let events = JSON.parse(JSON.stringify(eventsData.events));

export const handlers = [
  http.get('/api/events', async () => {
    return HttpResponse.json({ events }, { status: 200 });
  }),

  // POST /api/events
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;

    // 새로운 ID 생성
    newEvent.id = String(events.length + 1);

    events.push(newEvent);

    return HttpResponse.json({ newEvent }, { status: 201 });
  }),

  // PUT /api/events/:id
  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event: Event) => event.id === id);

    if (index !== -1) {
      return HttpResponse.json({ ...events[index], ...updatedEvent });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // DELETE /api/events/:id
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event: Event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];
