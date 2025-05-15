import { createContext, useContext, ReactNode } from 'react';

import { useEventOperationsContext } from './EventOperationsContext';
import { useNotifications, UseNotificationsReturn } from '../hooks/useNotifications';

const NotificationsContext = createContext<UseNotificationsReturn | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { events } = useEventOperationsContext();
  const notifications = useNotifications(events);
  return (
    <NotificationsContext.Provider value={notifications}>{children}</NotificationsContext.Provider>
  );
};

export const useNotificationsContext = (): UseNotificationsReturn => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotificationsContext must be used within NotificationsProvider');
  return ctx;
};
