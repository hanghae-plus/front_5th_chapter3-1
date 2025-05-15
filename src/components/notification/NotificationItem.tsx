import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';
import React from 'react';

export const NotificationItem = ({
  notification,
  setNotifications,
}: {
  notification: { id: string; message: string };
  setNotifications: React.Dispatch<React.SetStateAction<{ id: string; message: string }[]>>;
}) => {
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
};
