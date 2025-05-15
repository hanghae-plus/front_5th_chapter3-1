import { ChangeEvent, useState } from 'react';

import { Event, EventForm, RepeatInfo } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [eventForm, setEventForm] = useState<EventForm>(
    () =>
      initialEvent || {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '',
        repeat: {
          type: 'none',
          interval: 1,
          endDate: '',
        },
        notificationTime: 10,
      }
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
    setEventForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: '',
      },
      notificationTime: 10,
    });
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      date: event.date || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      description: event.description || '',
      location: event.location || '',
      category: event.category || '',
      repeat: {
        type: event.repeat?.type || 'none',
        interval: event.repeat?.interval || 1,
        endDate: event.repeat?.endDate || '',
      },
      notificationTime: event.notificationTime || 10,
    });
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
