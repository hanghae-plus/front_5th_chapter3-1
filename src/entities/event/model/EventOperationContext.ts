import { createContext, useContext } from 'react';

import { EventOperationsContextType } from './EventOperationsContextType';

export const EventOperationsContext = createContext<EventOperationsContextType | undefined>(
  undefined
);

export const useEventOperationsContext = () => {
  const context = useContext(EventOperationsContext);
  if (!context) {
    throw new Error('useEventOperationsContext 는 EventOperationsProvider 내부에서 사용!!');
  }
  return context;
};
