import { useEventForm, useEventOperations, useNotifications } from '@/hooks';
import { VStack } from '@chakra-ui/react';
import { Notification } from './Notification';

export function NotificationList() {
  const { editingEvent, setEditingEvent } = useEventForm();
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const { notifications } = useNotifications(events);
  return (
    <>
      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification) => (
            <Notification key={notification.id} notification={notification} />
          ))}
        </VStack>
      )}
    </>
  );
}
