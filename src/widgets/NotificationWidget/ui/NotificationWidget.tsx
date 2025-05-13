import { Alert, AlertIcon, VStack, Box, AlertTitle, CloseButton } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';

interface Notification {
  id: string;
  message: string;
}

interface NotificationWidgetProps {
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
}

export const NotificationWidget = ({
  notifications,
  setNotifications,
}: NotificationWidgetProps) => {
  if (notifications.length === 0) return null;

  const handleClose = (index: number) => {
    setNotifications((prev: Notification[]) => prev.filter((_, i) => i !== index));
  };

  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map((notification, index) => (
        <Alert key={index} status="info" variant="solid" width="auto">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
          </Box>
          <CloseButton onClick={() => handleClose(index)} />
        </Alert>
      ))}
    </VStack>
  );
};
