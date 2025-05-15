import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

interface Props {
  notifications: any;
  onClose: (index: number) => void;
}

export function NotificationToast({ notifications, onClose }: Props) {
  if (notifications.length === 0) return null;

  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map(
        (
          notification: {
            message:
              | string
              | number
              | boolean
              | ReactElement<any, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | null
              | undefined;
          },
          index: number
        ) => (
          <Alert key={index} status="info" variant="solid" width="auto">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
            </Box>
            <CloseButton onClick={() => onClose(index)} />
          </Alert>
        )
      )}
    </VStack>
  );
}
