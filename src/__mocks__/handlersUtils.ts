import { Event } from '../types';

class EventStore {
  private events: Event[] = [];

  constructor(initialEvents: Event[] = []) {
    this.events = [...initialEvents];
  }

  getAll(): Event[] {
    return [...this.events];
  }

  add(event: Omit<Event, 'id'>): Event {
    const newEvent = {
      ...event,
      id: String(this.events.length + 1),
    };
    this.events = [...this.events, newEvent];
    return newEvent;
  }

  update(id: string, update: Partial<Event>): Event {
    const index = this.events.findIndex((event) => event.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }

    const updatedEvent = {
      ...this.events[index],
      ...update,
    };

    this.events = [...this.events.slice(0, index), updatedEvent, ...this.events.slice(index + 1)];

    return updatedEvent;
  }

  delete(id: string): void {
    const index = this.events.findIndex((event) => event.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found`);
    }

    this.events = [...this.events.slice(0, index), ...this.events.slice(index + 1)];
  }
}

let eventStore: EventStore;

export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  eventStore = new EventStore(initEvents);
};

export const setupMockHandlerFetch = () => eventStore.getAll();

export const setupMockHandlerAppend = (event: Omit<Event, 'id'>) => {
  return eventStore.add(event);
};

export const setupMockHandlerUpdateById = (id: string, update: Partial<Event>) => {
  return eventStore.update(id, update);
};

export const setupMockHandlerDeletion = (id: string) => {
  eventStore.delete(id);
};
