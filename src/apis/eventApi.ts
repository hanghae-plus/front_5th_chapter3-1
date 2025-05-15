import { Event, EventForm } from '../types';

const API_ENDPOINTS = {
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,
};

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch(API_ENDPOINTS.EVENTS);

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  return data.events;
};

export const createEvent = async (eventData: EventForm): Promise<Event> => {
  const response = await fetch(API_ENDPOINTS.EVENTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error('Failed to create event');
  }

  return response.json();
};

export const updateEvent = async (id: string, eventData: Event | EventForm): Promise<Event> => {
  const response = await fetch(API_ENDPOINTS.EVENT_BY_ID(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error('Failed to update event');
  }

  return response.json();
};

export const deleteEvent = async (id: string): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.EVENT_BY_ID(id), {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
};
