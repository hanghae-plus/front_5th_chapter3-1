import { ChangeEvent, createContext, ReactNode, useContext } from 'react';

import { useEventForm } from '../hooks';
import { Event, RepeatType } from '../types';

type EventFormContextType = {
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  startTime: string;
  endTime: string;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (value: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (value: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (value: string) => void;
  notificationTime: number;
  setNotificationTime: (value: number) => void;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
  setEditingEvent: (event: Event | null) => void;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  editEvent: (event: Event) => void;
};

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

export function EventFormProvider({ children }: { children: ReactNode }) {
  const eventFormValues = useEventForm();

  return <EventFormContext.Provider value={eventFormValues}>{children}</EventFormContext.Provider>;
}

export function useEventFormContext() {
  const context = useContext(EventFormContext);
  if (context === undefined) {
    throw new Error('useEventFormContext must be used within an EventFormProvider');
  }
  return context;
}
