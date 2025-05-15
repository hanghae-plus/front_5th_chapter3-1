import { useEventForm, useEventOperations, useNotifications } from '@/hooks';
import type { Notification as NotificationType } from '@/types';
import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';

interface NotificationProps {
  notification: NotificationType;
}

export function Notification({ notification }: NotificationProps) {
  const { editingEvent, setEditingEvent } = useEventForm();
  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const { setNotifications } = useNotifications(events);

  return (
    <Alert key={notification.id} status="info" variant="solid" width="auto">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
      </Box>
      <CloseButton
        onClick={() => setNotifications((prev) => prev.filter(({ id }) => id !== notification.id))}
      />
    </Alert>
  );
}
