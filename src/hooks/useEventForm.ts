import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '@/types';
import { getTimeErrorMessage } from '@/utils';
import { EventFormData } from '@/components/EventForm';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent?: Event) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialEvent?.title || '',
    date: initialEvent?.date || '',
    startTime: initialEvent?.startTime || '',
    endTime: initialEvent?.endTime || '',
    description: initialEvent?.description || '',
    location: initialEvent?.location || '',
    category: initialEvent?.category || '',
    isRepeating: initialEvent?.repeat.type !== 'none',
    repeatType: initialEvent?.repeat.type || 'none',
    repeatInterval: initialEvent?.repeat.interval || 1,
    repeatEndDate: initialEvent?.repeat.endDate || '',
    notificationTime: initialEvent?.notificationTime || 10,
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleFormChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setFormData((prev) => ({
      ...prev,
      startTime: newStartTime,
    }));
    setTimeError(getTimeErrorMessage(newStartTime, formData.endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setFormData((prev) => ({
      ...prev,
      endTime: newEndTime,
    }));
    setTimeError(getTimeErrorMessage(formData.startTime, newEndTime));
  };

  const resetForm = () => {
    setFormData({
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
    setFormData({
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

  return {
    ...formData,
    formData,
    handleFormChange,
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
