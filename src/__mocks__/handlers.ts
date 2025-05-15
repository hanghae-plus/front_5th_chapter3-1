import { http, HttpResponse } from 'msw';

import type { Event } from '../types';
import { events } from './response/events.json';

let mockEvents = {
  events,
};

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => HttpResponse.json(mockEvents)),

  http.post('/api/events', async ({ request }) => {
    const data = (await request.json()) as Event;
    const newEvent = { ...data, id: crypto.randomUUID() };

    mockEvents = {
      events: [...mockEvents.events, newEvent],
    };

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;
    const eventData = (await request.json()) as Event;

    const targetEvent = mockEvents.events.find((event) => event.id === id);

    if (!targetEvent) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = {
      ...targetEvent,
      ...eventData,
    };
    mockEvents.events = mockEvents.events.map((event) => (event.id === id ? updatedEvent : event));

    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    mockEvents.events = mockEvents.events.filter((event) => event.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),
];
