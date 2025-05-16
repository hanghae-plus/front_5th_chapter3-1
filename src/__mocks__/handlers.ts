import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { isExistingEvent, generateEventId } from './helpers';
import { events as jsonEvents } from './response/events.json' assert { type: 'json' };
const events = jsonEvents as Event[];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events }, { status: 200 });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;

    newEvent.id = generateEventId();

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    if (!isExistingEvent(events, params.id as string)) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = (await request.json()) as Event;

    return HttpResponse.json(updatedEvent, { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    if (!isExistingEvent(events, params.id as string)) {
      return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return HttpResponse.json({ message: 'Event deleted' }, { status: 200 });
  }),
];
