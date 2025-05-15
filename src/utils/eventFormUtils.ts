import { Event, EventForm } from '../types';

import { DEFAULT_EVENT_FORM } from '@/constants/form';

export function convertEventToForm(event: Event): EventForm {
  // id를 제외한 이벤트 속성만 추출
  const { id, ...eventWithoutId } = event;

  return {
    ...DEFAULT_EVENT_FORM,
    ...Object.fromEntries(Object.entries(eventWithoutId).filter(([_, value]) => value != null)),
    repeat: {
      ...DEFAULT_EVENT_FORM.repeat,
      ...(event.repeat || {}),
    },
  };
}

export function convertFormToEventData(
  eventForm: EventForm,
  isRepeating: boolean,
  editingEvent: Event | null
): Event | EventForm {
  return {
    ...(editingEvent ? { id: editingEvent.id } : {}),
    ...eventForm,
    repeat: {
      ...eventForm.repeat,
      type: isRepeating ? eventForm.repeat.type : 'none',
      endDate: eventForm.repeat.endDate || undefined,
    },
  };
}
