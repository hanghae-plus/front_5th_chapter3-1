import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import React from 'react';

import { Notification } from '../types';

export const NotificationComponent = ({
  notifications,
  setNotifications,
}: {
  notifications: Notification[];
  setNotifications: (value: React.SetStateAction<Notification[]>) => void;
}) => {
  return (
    notifications.length > 0 && (
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
    )
  );
};
