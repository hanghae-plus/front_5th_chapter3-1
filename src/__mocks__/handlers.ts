import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.

let mockEvents = [...events];

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents }, { status: 200 });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    mockEvents.push(newEvent);
    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const id = params.id as string;
    const updatedEvent = (await request.json()) as Event;
    mockEvents = mockEvents.map((event) => (event.id === id ? updatedEvent : event));
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id as string;
    const deletedEvent = mockEvents.find((event) => event.id === id);
    mockEvents = mockEvents.filter((event) => event.id !== id);
    return HttpResponse.json({ success: true, event: deletedEvent }, { status: 200 });
  }),
];
