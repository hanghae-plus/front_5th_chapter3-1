import { ChangeEvent, useState, useCallback } from 'react';

import { INITIAL_FORM_STATE } from '../constants/initialFormState';
import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title ?? INITIAL_FORM_STATE.title);
  const [date, setDate] = useState(initialEvent?.date ?? INITIAL_FORM_STATE.date);
  const [startTime, setStartTime] = useState(
    initialEvent?.startTime ?? INITIAL_FORM_STATE.startTime
  );
  const [endTime, setEndTime] = useState(initialEvent?.endTime ?? INITIAL_FORM_STATE.endTime);
  const [description, setDescription] = useState(
    initialEvent?.description ?? INITIAL_FORM_STATE.description
  );
  const [location, setLocation] = useState(initialEvent?.location ?? INITIAL_FORM_STATE.location);
  const [category, setCategory] = useState(initialEvent?.category ?? INITIAL_FORM_STATE.category);
  const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');
  const [repeatType, setRepeatType] = useState<RepeatType>(
    initialEvent?.repeat.type ?? INITIAL_FORM_STATE.repeatType
  );
  const [repeatInterval, setRepeatInterval] = useState(
    initialEvent?.repeat.interval ?? INITIAL_FORM_STATE.repeatInterval
  );
  const [repeatEndDate, setRepeatEndDate] = useState(
    initialEvent?.repeat.endDate ?? INITIAL_FORM_STATE.repeatEndDate
  );
  const [notificationTime, setNotificationTime] = useState(
    initialEvent?.notificationTime ?? INITIAL_FORM_STATE.notificationTime
  );

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetForm = () => {
    setTitle(INITIAL_FORM_STATE.title);
    setDate(INITIAL_FORM_STATE.date);
    setStartTime(INITIAL_FORM_STATE.startTime);
    setEndTime(INITIAL_FORM_STATE.endTime);
    setDescription(INITIAL_FORM_STATE.description);
    setLocation(INITIAL_FORM_STATE.location);
    setCategory(INITIAL_FORM_STATE.category);
    setIsRepeating(INITIAL_FORM_STATE.isRepeating);
    setRepeatType(INITIAL_FORM_STATE.repeatType);
    setRepeatInterval(INITIAL_FORM_STATE.repeatInterval);
    setRepeatEndDate(INITIAL_FORM_STATE.repeatEndDate);
    setNotificationTime(INITIAL_FORM_STATE.notificationTime);
  };

  const editEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
  }, []);

  return {
    values: {
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
    },
    setters: {
      setTitle,
      setDate,
      setStartTime,
      setEndTime,
      setDescription,
      setLocation,
      setCategory,
      setIsRepeating,
      setRepeatType,
      setRepeatInterval,
      setRepeatEndDate,
      setNotificationTime,
    },
    errors: {
      startTimeError,
      endTimeError,
    },
    handlers: {
      handleStartTimeChange,
      handleEndTimeChange,
    },
    editingEvent,
    setEditingEvent,
    resetForm,
    editEvent,
  };
};
