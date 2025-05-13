import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import {
  setupMockHandlerAppend,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerFetch,
  setupMockHandlerUpdateById,
} from './handlersUtils';
import { events } from './response/events.json' assert { type: 'json' };

setupMockHandlerCreation(events as Event[]);

export const handlers = [
  http.get('/api/events', () => {
    try {
      const events = setupMockHandlerFetch();
      return HttpResponse.json({ events });
    } catch (error) {
      return new HttpResponse(null, { status: 500 });
    }
  }),

  http.post('/api/events', async ({ request }) => {
    try {
      const eventData = (await request.json()) as Omit<Event, 'id'>;
      const newEvent = setupMockHandlerAppend(eventData);
      return HttpResponse.json({ event: newEvent });
    } catch (error) {
      return new HttpResponse(null, { status: 400 });
    }
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    try {
      const id = params.id as string;
      const update = (await request.json()) as Partial<Event>;
      const updatedEvent = setupMockHandlerUpdateById(id, update);
      return HttpResponse.json({ event: updatedEvent });
    } catch (error) {
      return new HttpResponse(null, { status: 404 });
    }
  }),

  http.delete('/api/events/:id', ({ params }) => {
    try {
      const id = params.id as string;
      setupMockHandlerDeletion(id);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return new HttpResponse(null, { status: 404 });
    }
  }),
];
