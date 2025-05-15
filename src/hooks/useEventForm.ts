import { ChangeEvent, useState } from 'react';

import { Event, EventForm, RepeatInfo } from '../types';
import { convertEventToForm } from '../utils/eventFormUtils';
import { getTimeErrorMessage } from '../utils/timeValidation';

import { DEFAULT_EVENT_FORM } from '@/constants/form';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [eventForm, setEventForm] = useState<EventForm>(() =>
    initialEvent ? convertEventToForm(initialEvent) : DEFAULT_EVENT_FORM
  );
  const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleOnChangeEvent = (
    key: keyof Event | keyof RepeatInfo,
    value: string | number | RepeatInfo
  ) => {
    setEventForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setEventForm((prev) => ({
      ...prev,
      startTime: newStartTime,
    }));
    setTimeError(getTimeErrorMessage(newStartTime, eventForm.endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEventForm((prev) => ({
      ...prev,
      endTime: newEndTime,
    }));
    setTimeError(getTimeErrorMessage(eventForm.startTime, newEndTime));
  };

  const resetForm = () => {
    setEventForm(DEFAULT_EVENT_FORM);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm(convertEventToForm(event));
  };

  return {
    eventForm,
    handleOnChangeEvent,

    location,
    isRepeating,
    setIsRepeating,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  };
};
