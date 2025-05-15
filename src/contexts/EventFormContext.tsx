import React, { createContext, ReactNode, useContext, useReducer } from 'react';

import { Event, RepeatType } from '../types';

export interface EventFormState {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType | 'none';
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
  startTimeError: string;
  endTimeError: string;
  editingEvent: Event | null;
}

const initialState: EventFormState = {
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
  startTimeError: '',
  endTimeError: '',
  editingEvent: null,
};

type EventFormAction =
  | { type: 'SET_FIELD'; field: keyof EventFormState; value: unknown }
  | { type: 'RESET'; initialState: EventFormState }
  | { type: 'SET_EDITING_EVENT'; editingEvent: Event | null };

function reducer(state: EventFormState, action: EventFormAction): EventFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { ...action.initialState };
    case 'SET_EDITING_EVENT':
      return { ...state, editingEvent: action.editingEvent };
    default:
      return state;
  }
}

interface EventFormContextValue {
  state: EventFormState;
  dispatch: React.Dispatch<EventFormAction>;
}

const EventFormContext = createContext<EventFormContextValue | undefined>(undefined);

export const EventFormProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EventFormContext.Provider value={{ state, dispatch }}>{children}</EventFormContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useEventFormContext = () => {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error('useEventFormContext must be used within an EventFormProvider');
  }
  return context;
};
