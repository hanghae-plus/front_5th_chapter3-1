import { useContext } from 'react';

import { EventContext } from '@/entities/event/model/EventContext';

export const useEventOperations = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventOperations must be used within EventProvider');
  }

  // operations 관련 값들만 return
  const { events, fetchEvents, saveEvent, deleteEvent } = context;
  return { events, fetchEvents, saveEvent, deleteEvent };
};
