import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import React, { FC } from 'react';

type Notification = {
  id: string;
  message: string;
};

type NotificationDisplayProps = {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
};

const NotificationDisplay: FC<NotificationDisplayProps> = ({ notifications, setNotifications }) => {
  if (notifications.length === 0) return null;

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
};

export default NotificationDisplay;
