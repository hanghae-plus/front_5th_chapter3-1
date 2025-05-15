import { VStack } from '@chakra-ui/react';

import { CustomAlert } from '@/components/molecules/custom-alert';
import { NotificationProps } from '@/hooks/useNotifications.ts';

interface AlertContainerProps {
  notifications: NotificationProps[];
  removeNotification: (index: number) => void;
}

export const AlertContainer = ({ notifications, removeNotification }: AlertContainerProps) => {
  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map((notification, index) => (
        <CustomAlert
          key={index}
          message={notification.message}
          onClickCloseButton={() => removeNotification(index)}
        />
      ))}
    </VStack>
  );
};
