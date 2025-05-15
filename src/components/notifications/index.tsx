import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

import { useEventForm } from '@/hooks/useEventForm.ts';
import { useEventOperations } from '@/hooks/useEventOperations.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';

export const Notifications = () => {
  const { editingEvent, setEditingEvent } = useEventForm();

  const { events } = useEventOperations(Boolean(editingEvent), () => setEditingEvent(null));

  const { notifications, setNotifications } = useNotifications(events);

  return (
    <>
      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert key={index} status="info" variant="solid" width="auto">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </>
  );
};
