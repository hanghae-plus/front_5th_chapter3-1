import { useEventOperations } from '../../../entities/event/api/useEventOperations';
import { useNotifications } from '../../../hooks/useNotifications';
import { Event } from '../../../types';

export const useEventOperationsStateAndActions = (
  editingEvent: Event | null,
  onEditComplete: () => void
) => {
  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(editingEvent),
    onEditComplete
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);

  return {
    operationsState: {
      events,
      notifications,
      notifiedEvents,
    },
    operationsActions: {
      saveEvent,
      deleteEvent,
      setNotifications,
    },
  };
};
