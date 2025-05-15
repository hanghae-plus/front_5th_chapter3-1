import { ChangeEvent } from 'react';

import useEventValidation from './useEventValidation';
import { useEventFormContext } from '../contexts/event-form-context';
import { Event, EventForm, EventFormState } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

export const useEventForm = () => {
  const {
    eventForm,
    setEventForm,
    editingEvent,
    setEditingEvent,
    startTimeError,
    endTimeError,
    setTimeError,
  } = useEventFormContext();

  const { validate } = useEventValidation();

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setEventForm((prev: EventFormState) => ({ ...prev, startTime: newStartTime }));
    setTimeError(getTimeErrorMessage(newStartTime, eventForm.endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEventForm((prev: EventFormState) => ({ ...prev, endTime: newEndTime }));
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
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
    });
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      location: event.location,
      category: event.category,
      isRepeating: event.repeat.type !== 'none',
      repeatType: event.repeat.type,
      repeatInterval: event.repeat.interval,
      repeatEndDate: event.repeat.endDate || '',
      notificationTime: event.notificationTime,
    });
  };

  const addOrUpdateEvent = async (
    events: Event[],
    saveEvent: (event: Event | EventForm) => Promise<void>,
    checkOverlap: (eventData: Event | EventForm, events: Event[]) => boolean
  ) => {
    const {
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      isRepeating,
      repeatType,
      repeatInterval,
      repeatEndDate,
      notificationTime,
    } = eventForm;

    if (!validate(eventForm, startTimeError, endTimeError)) {
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    if (checkOverlap(eventData, events)) {
      return;
    }
    await saveEvent(eventData);
    resetForm();
  };

  return {
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    addOrUpdateEvent,
  };
};
