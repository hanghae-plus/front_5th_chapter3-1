import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import React from 'react';

type Notification = {
  id: string;
  message: string;
};

type Props = {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
};

const NotificationToasts = ({ notifications, setNotifications }: Props) => {
  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end" zIndex={9999}>
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

export default NotificationToasts;
