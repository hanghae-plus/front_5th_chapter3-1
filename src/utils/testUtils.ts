import { Event, EventForm } from '../types';

export function createTestEvent(overrides: Partial<EventForm & { id?: string }> = {}): Event {
  return {
    id: overrides.id ?? Math.random().toString(),
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    title: '',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
    ...overrides,
  };
}
