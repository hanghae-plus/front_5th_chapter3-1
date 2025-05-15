import { createContext, ReactNode, useContext } from 'react';

import { useNotifications } from '../hooks/useNotifications';

const NotificationContext = createContext<ReturnType<typeof useNotifications>>(null!);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications(events);

  return (
    <NotificationContext.Provider value={notifications}>{children}</NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}
