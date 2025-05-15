import { VStack } from '@chakra-ui/react';
import React from 'react';

import { NotificationItem } from './NotificationItem';

export const NotificationList = ({
  notifications,
  setNotifications,
}: {
  notifications: { id: string; message: string }[];
  setNotifications: React.Dispatch<React.SetStateAction<{ id: string; message: string }[]>>;
}) => {
  return (
    <>
      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              setNotifications={setNotifications}
            />
          ))}
        </VStack>
      )}
    </>
  );
};
