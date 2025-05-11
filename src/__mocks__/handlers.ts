import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

interface EventForm {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: {
    type: string;
    interval: number;
  };
  notificationTime: number;
}

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as EventForm;
    events.push(newEvent);
    return HttpResponse.json(newEvent);
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = await request.json();

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex > -1) {
      const newEvents = [...events];
      newEvents[eventIndex] = { ...events[eventIndex], ...updatedEvent };
      return HttpResponse.json(newEvents[eventIndex]);
    }
    return HttpResponse.json(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    events.filter((event) => event.id !== id);
    return HttpResponse.json(null, { status: 204 });
  }),
];
