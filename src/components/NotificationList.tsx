import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

import { Notification } from '../types';

interface Props {
  notifications: Notification[];
  onClose: (id: number) => void;
}

const NotificationList = ({ notifications, onClose }: Props) => {
  if (notifications.length === 0) return null;

  return (
    <VStack
      position="fixed"
      top={4}
      right={4}
      spacing={2}
      align="flex-end"
      data-testid="notification-list"
    >
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

export default NotificationList;
