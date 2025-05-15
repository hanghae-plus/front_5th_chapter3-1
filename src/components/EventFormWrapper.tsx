import React, { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import { EventFormProvider } from '../contexts/EventFormContext';
import type { Event, RepeatType, EventForm as EventFormType } from '../types';
import { EventForm } from './EventForm';

interface Props {
  editingEvent?: Event | null;
  saveEvent?: (event: Event) => Promise<void>;
}

export const EventFormWrapper = ({ editingEvent = null, saveEvent }: Props) => {
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [date, setDate] = useState(editingEvent?.date || '');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [category, setCategory] = useState(editingEvent?.category || '');
  const [notificationTime, setNotificationTime] = useState(editingEvent?.notificationTime || 10);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeat, setRepeat] = useState(
    editingEvent?.repeat || { type: 'none' as const, interval: 1, endDate: undefined }
  );

  const form: EventFormType & {
    isRepeating: boolean;
    startTimeError: string | null;
    endTimeError: string | null;
  } = {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    notificationTime,
    isRepeating,
    repeat,
    startTimeError: null,
    endTimeError: null,
  };

  const handleSaveEvent = async () => {
    if (saveEvent) {
      await saveEvent({
        id: editingEvent?.id || '',
        title,
        date,
        startTime,
        endTime,
        description,
        location,
        category,
        notificationTime,
        repeat,
      });
    }
  };

  const handlers = {
    setTitle: (value: string) => setTitle(value),
    setDate: (value: string) => setDate(value),
    setDescription: (value: string) => setDescription(value),
    setLocation: (value: string) => setLocation(value),
    setCategory: (value: string) => setCategory(value),
    setNotificationTime: (value: number) => setNotificationTime(value),
    setIsRepeating: (value: boolean) => setIsRepeating(value),
    setOverlappingEvents: () => {},
    setIsOverlapDialogOpen: () => {},
    setRepeatType: (type: RepeatType) => setRepeat((prev) => ({ ...prev, type })),
    setRepeatInterval: (interval: number) => setRepeat((prev) => ({ ...prev, interval })),
    setRepeatEndDate: (endDate: string) => setRepeat((prev) => ({ ...prev, endDate })),
    handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value),
    handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value),
    saveEvent: handleSaveEvent,
    resetForm: () => {
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setDescription('');
      setLocation('');
      setCategory('');
      setNotificationTime(10);
      setIsRepeating(false);
      setRepeat({ type: 'none', interval: 1, endDate: undefined });
    },
  };

  return (
    <ChakraProvider>
      <EventFormProvider>
        <EventForm
          events={[]}
          editingEvent={editingEvent}
          eventForm={form}
          eventHandlers={handlers}
        />
      </EventFormProvider>
    </ChakraProvider>
  );
};

export default EventFormWrapper;
