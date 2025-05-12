import { Event } from '../types';

let eventStore = [] as Event[];
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  eventStore = initEvents;
};

export const setupMockHandlerUpdateById = (update: Event[]) => {
  eventStore = update;
};

export const setupMockHandlerAppend = (update: Event) => {
  eventStore = [...eventStore, update];
};

export const setupMockHandlerDeletion = (id: string) => {
  eventStore = eventStore.filter((event) => Number(event.id) !== Number(id));
};

export const setupMockHandlerFetch = () => eventStore;
