import { Event, EventForm } from '../../types';
import {
  createInitialDialogState,
  createOpenDialogState,
  createClosedDialogState,
} from '../../utils/dialogState';

describe('createInitialDialogState', () => {
  it('초기 다이얼로그 상태를 생성해야 함', () => {
    const state = createInitialDialogState();
    expect(state).toEqual({
      isOpen: false,
      overlappingEvents: [],
      pendingEvent: null,
    });
  });
});

describe('createOpenDialogState', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 일정',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const eventToSave: EventForm = {
    title: '새로운 일정',
    date: '2025-05-16',
    startTime: '10:30',
    endTime: '11:30',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('열린 다이얼로그 상태를 생성해야 함', () => {
    const state = createOpenDialogState(events, eventToSave);
    expect(state).toEqual({
      isOpen: true,
      overlappingEvents: events,
      pendingEvent: eventToSave,
    });
  });
});

describe('createClosedDialogState', () => {
  it('닫힌 다이얼로그 상태를 생성해야 함', () => {
    const state = createClosedDialogState();
    expect(state).toEqual({
      isOpen: false,
      overlappingEvents: [],
      pendingEvent: null,
    });
  });
});
