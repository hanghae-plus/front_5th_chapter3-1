import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';
import { events as defaultEvents } from './response/events.json' assert { type: 'json' };

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
const createEventList = (initialEvents?: Event[]): Event[] =>
  typeof initialEvents !== 'undefined' ? [...initialEvents] : [...(defaultEvents as Event[])];

const createMockHandlers = (eventList: Event[]) => ({
  getEvents: http.get('/api/events', () => HttpResponse.json({ events: eventList })),

  createEvent: http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    const createdEvent = { ...newEvent, id: String(eventList.length + 1) };

    eventList.push(createdEvent);

    return HttpResponse.json(createdEvent, { status: 201 });
  }),

  updateEvent: http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const eventIndex = eventList.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const mergedEvent = { ...eventList[eventIndex], ...updatedEvent };

    eventList[eventIndex] = mergedEvent;

    return HttpResponse.json(mergedEvent);
  }),

  deleteEvent: http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = eventList.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    eventList.splice(eventIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  getEventsFailure: http.get('/api/events', () => new HttpResponse(null, { status: 500 })),
  deleteEventFailure: http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 })),
});

export const setupMockHandlerCreation = (initialEvents?: Event[]) => {
  const eventList = createEventList(initialEvents);
  const handlers = createMockHandlers(eventList);

  server.use(handlers.getEvents, handlers.createEvent);
};

export const setupMockHandlerUpdating = (initialEvents?: Event[]) => {
  const eventList = createEventList(initialEvents);
  const handlers = createMockHandlers(eventList);

  server.use(handlers.getEvents, handlers.updateEvent);
};

export const setupMockHandlerDeletion = (initialEvents?: Event[]) => {
  const eventList = createEventList(initialEvents);
  const handlers = createMockHandlers(eventList);

  server.use(handlers.getEvents, handlers.deleteEvent);
};

export const setupMockHandlerNetworkFailure = (initialEvents?: Event[]) => {
  const eventList = createEventList(initialEvents);
  const handlers = createMockHandlers(eventList);

  server.use(handlers.getEventsFailure, handlers.deleteEventFailure);
};
