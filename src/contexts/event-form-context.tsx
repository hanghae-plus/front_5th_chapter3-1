import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
  SetStateAction,
  Dispatch,
} from 'react';

import { Event, EventFormState, TimeErrorRecord } from '../types';

interface EventFormContextType {
  eventForm: EventFormState;
  setEventForm: Dispatch<SetStateAction<EventFormState>>;
  editingEvent: Event | null;
  setEditingEvent: Dispatch<SetStateAction<Event | null>>;
  startTimeError: string | null;
  endTimeError: string | null;
  setTimeError: Dispatch<SetStateAction<TimeErrorRecord>>;
}

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

interface EventFormProviderProps {
  children: ReactNode;
  initialEvent?: Event;
}

export const EventFormProvider = ({ children, initialEvent }: EventFormProviderProps) => {
  const [eventForm, setEventForm] = useState<EventFormState>({
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

  const value = useMemo(() => {
    return {
      eventForm,
      setEventForm,
      editingEvent,
      setEditingEvent,
      startTimeError,
      endTimeError,
      setTimeError,
    };
  }, [
    eventForm,
    setEventForm,
    editingEvent,
    setEditingEvent,
    startTimeError,
    endTimeError,
    setTimeError,
  ]);

  return <EventFormContext.Provider value={value}>{children}</EventFormContext.Provider>;
};

export const useEventFormContext = (): EventFormContextType => {
  const context = useContext(EventFormContext);

  if (context === undefined) {
    throw new Error('useEventFormContext must be used within an EventFormProvider');
  }
  return context;
};
