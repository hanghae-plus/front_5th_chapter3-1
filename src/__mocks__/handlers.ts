import { randomUUID } from 'node:crypto';

import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

const mockEvents = [...events];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents }, { status: 200 });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    mockEvents.push({ ...newEvent, id: randomUUID() });
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request }) => {
    const updatedEvent = (await request.json()) as Event;
    const eventIndex = mockEvents.findIndex((event) => event.id === updatedEvent.id);
    if (eventIndex === -1) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    mockEvents[eventIndex] = updatedEvent;
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = mockEvents.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return HttpResponse.json({ success: false }, { status: 404 });
    }
    mockEvents.splice(eventIndex, 1);
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
