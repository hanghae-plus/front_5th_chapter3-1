import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import React from 'react';

interface NotificationProps {
  notifications: { id: string; message: string }[];
  setNotifications: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        message: string;
      }[]
    >
  >;
}

export function Notification(props: NotificationProps) {
  const { notifications, setNotifications } = props;

  return (
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
  );
}
