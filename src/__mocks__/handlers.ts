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
    const newEvent = await request.json();
    const newEvents = [...events, newEvent];
    return HttpResponse.json({ events: newEvents });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const updatedEvent = await request.json();
    const updatedEvents = events.map((event) => (event.id === params.id ? updatedEvent : event));
    return HttpResponse.json({ events: updatedEvents });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const updatedEvents = events.filter((event) => event.id !== params.id);
    return HttpResponse.json({ events: updatedEvents });
  }),
];
