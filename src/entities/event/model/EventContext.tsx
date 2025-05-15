import { createContext, useContext } from 'react';

import { EventContextType } from '@/entities/event/model/EventContextType';

export const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext 는 EventContext.Provider 내부에서 사용 가능');
  }
  return context;
};
