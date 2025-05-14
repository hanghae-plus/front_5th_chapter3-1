import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import React from 'react';

import { NotificationMessageType } from '../../base/types/notification.types';

interface NotificationAlarmProps {
  notifications: NotificationMessageType[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationMessageType[]>>;
}

const NotificationAlarm = ({ notifications, setNotifications }: NotificationAlarmProps) => {
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
};

export default NotificationAlarm;
