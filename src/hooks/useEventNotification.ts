import { useState } from 'react';

export const useEventNotification = (initialTime = 10) => {
  const [notificationTime, setNotificationTime] = useState(initialTime);

  const resetNotification = () => {
    setNotificationTime(10);
  };

  return {
    notificationTime,
    setNotificationTime,
    resetNotification,
  };
};
