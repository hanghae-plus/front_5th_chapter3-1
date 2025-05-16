import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import React from 'react';

export interface NotificationMessage {
  id: string;
  message: string;
  // You might want to add other properties like type, etc.
}

interface NotificationDisplayProps {
  notifications: NotificationMessage[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationMessage[]>>;
}

export function NotificationDisplay({ notifications, setNotifications }: NotificationDisplayProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map((notification) => (
        <Alert key={notification.id} status="info" variant="solid" width="auto">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
          </Box>
          <CloseButton
            onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
          />
        </Alert>
      ))}
    </VStack>
  );
}
