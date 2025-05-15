/* eslint-disable no-unused-vars */
import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

interface Notification {
  message: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onClose: (index: number) => void;
}

export const Notifications = ({ notifications, onClose }: NotificationsProps) => {
  if (notifications.length === 0) return null;

  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map((notification, index) => (
        <Alert key={index} status="info" variant="solid" width="auto">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
          </Box>
          <CloseButton onClick={() => onClose(index)} />
        </Alert>
      ))}
    </VStack>
  );
};
