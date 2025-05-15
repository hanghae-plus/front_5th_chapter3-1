import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import { isExistingEvent, generateEventId } from './helpers';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export class HandlersBuilder {
  private events: Event[] = [];

  constructor(initialEvents: Event[] = []) {
    this.events = [...initialEvents];
  }

  createAll() {
    return [this.getEvents(), this.createEvent(), this.updateEvent(), this.deleteEvent()];
  }

  getEvents() {
    return http.get('/api/events', () => {
      return HttpResponse.json({ events: this.events }, { status: 200 });
    });
  }

  createEvent() {
    return http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as EventForm;

      const eventWithId = {
        ...newEvent,
        id: generateEventId(),
      } satisfies Event;

      this.events = [...this.events, eventWithId];

      return HttpResponse.json(eventWithId, { status: 201 });
    });
  }

  updateEvent() {
    return http.put('/api/events/:id', async ({ params, request }) => {
      const updatedEvent = (await request.json()) as Event;

      if (!isExistingEvent(this.events, params.id as string)) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      if (params.id !== updatedEvent.id) {
        return HttpResponse.json({ error: 'Event ID mismatch' }, { status: 400 });
      }

      this.events = this.events.map((event) => (event.id === params.id ? updatedEvent : event));

      return HttpResponse.json(updatedEvent, { status: 200 });
    });
  }

  deleteEvent() {
    return http.delete('/api/events/:id', ({ params }) => {
      if (!isExistingEvent(this.events, params.id as string)) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      this.events = this.events.filter((e) => e.id !== params.id);

      return HttpResponse.json({ message: 'Event deleted' }, { status: 200 });
    });
  }

  errorHandlers = {
    getEvents: () =>
      http.get('/api/events', () => {
        return HttpResponse.json({ message: 'Failed to fetch events' }, { status: 500 });
      }),

    saveEvent: () =>
      http.put('/api/events/:id', () => {
        return HttpResponse.json({ message: 'Failed to save event' }, { status: 500 });
      }),

    createEvent: () =>
      http.post('/api/events', () => {
        return HttpResponse.json({ message: 'Failed to create event' }, { status: 500 });
      }),

    deleteEvent: () =>
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({ message: 'Failed to delete event' }, { status: 500 });
      }),
  };

  scenarios = {
    loadingFailure: () => [this.errorHandlers.getEvents()],

    savingFailure: () => [this.getEvents(), this.errorHandlers.saveEvent()],

    creationFailure: () => [this.getEvents(), this.errorHandlers.createEvent()],

    deletionFailure: () => [this.getEvents(), this.errorHandlers.deleteEvent()],
  };
}
