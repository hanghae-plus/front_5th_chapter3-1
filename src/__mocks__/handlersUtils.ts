import { http, HttpResponse } from 'msw';

import { Event } from '../entities/event/model/types';

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  console.log('mockEvents', mockEvents);

  // server.use(
  //   http.get('/api/events', () => {
  //     return HttpResponse.json({ events: mockEvents });
  //   }),
  //   http.put('/api/events/:id', async ({ params, request }) => {
  //     const { id } = params;
  //     const updatedEvent = (await request.json()) as Event;
  //     const index = mockEvents.findIndex((event) => event.id === id);

  //     mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
  //     return HttpResponse.json(mockEvents[index]);
  //   })
  // );

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  console.log('mockEvents', mockEvents);

  // server.use(
  //   http.get('/api/events', () => {
  //     return HttpResponse.json({ events: mockEvents });
  //   }),
  //   http.delete('/api/events/:id', ({ params }) => {
  //     const { id } = params;
  //     const index = mockEvents.findIndex((event) => event.id === id);

  //     mockEvents.splice(index, 1);
  //     return new HttpResponse(null, { status: 204 });
  //   })
  // );

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
};
