import { createContext, useContext } from 'react';

import { useCalendarView } from './useCalendarView';
import { useDialog } from './useDialog';
import { useEventForm } from './useEventForm';
import { useEventOperations } from './useEventOperations';
import { useNotifications } from './useNotifications';
import { useSearch } from './useSearch';

export const CalendarViewContext = createContext<ReturnType<typeof useCalendarView> | null>(null);

export const useCalendarViewContext = () => {
  const ctx = useContext(CalendarViewContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const DialogContext = createContext<ReturnType<typeof useDialog> | null>(null);

export const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const EventFormContext = createContext<ReturnType<typeof useEventForm> | null>(null);

export const useEventFormContext = () => {
  const ctx = useContext(EventFormContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const EventOperationsContext = createContext<ReturnType<typeof useEventOperations> | null>(
  null
);

export const useEventOperationsContext = () => {
  const ctx = useContext(EventOperationsContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const NotificationsContext = createContext<ReturnType<typeof useNotifications> | null>(null);

export const useNotificationsContext = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const SearchContext = createContext<ReturnType<typeof useSearch> | null>(null);

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};
