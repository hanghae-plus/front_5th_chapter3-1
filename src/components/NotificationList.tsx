import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';

interface Notification {
  message: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onCloseNotification: (index: number) => void;
}

export function NotificationList({ notifications, onCloseNotification }: NotificationListProps) {
  if (notifications.length === 0) return null;

  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map((notification) => (
        <Alert key={notification.message} status="info" variant="solid" width="auto">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
          </Box>
          <CloseButton onClick={() => onCloseNotification(notifications.indexOf(notification))} />
        </Alert>
      ))}
    </VStack>
  );
}
