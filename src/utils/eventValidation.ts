import { Event, EventForm } from '../types';
import { findOverlappingEvents } from './eventOverlap';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  overlappingEvents?: Event[];
}

export const validateEventFields = (event: Event | EventForm): ValidationResult => {
  if (!event.title || !event.date || !event.startTime || !event.endTime) {
    return {
      isValid: false,
      errorMessage: '필수 정보를 모두 입력해주세요.',
    };
  }
  return { isValid: true };
};

export const validateEventTime = (
  event: Event | EventForm,
  existingEvents: Event[]
): ValidationResult => {
  const overlapping = findOverlappingEvents(event, existingEvents);
  if (overlapping.length > 0) {
    return {
      isValid: false,
      errorMessage: '시간이 겹치는 일정이 있습니다.',
      overlappingEvents: overlapping,
    };
  }
  return { isValid: true };
};
