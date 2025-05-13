import { EventForm } from '../types';

export function createTestEvent(overrides: Partial<EventForm> = {}): EventForm {
  return {
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 0,
    ...overrides,
  };
}
