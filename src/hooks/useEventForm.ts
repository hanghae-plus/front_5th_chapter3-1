import { useState } from 'react';

import { useEventBasicInfo } from './useEventBasicInfo';
import { useEventNotification } from './useEventNotification';
import { useEventRepeat } from './useEventRepeat';
import { useEventTime } from './useEventTime';
import { Event } from '../types';

export const useEventForm = (initialEvent?: Event) => {
  const basicInfo = useEventBasicInfo(initialEvent);
  const timeInfo = useEventTime(initialEvent?.startTime, initialEvent?.endTime);
  const repeatInfo = useEventRepeat(initialEvent?.repeat);
  const notificationInfo = useEventNotification(initialEvent?.notificationTime);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const resetForm = () => {
    basicInfo.resetBasicInfo();
    timeInfo.resetTime();
    repeatInfo.resetRepeat();
    notificationInfo.resetNotification();
  };

  const editEvent = (event: Event) => {
    basicInfo.setBasicInfo(event);
    timeInfo.setEventTime(event.startTime, event.endTime);
    setEditingEvent(event);
    repeatInfo.setRepeatInfo(event.repeat);
    notificationInfo.setNotificationTime(event.notificationTime);
  };

  return {
    ...basicInfo,
    ...timeInfo,
    ...repeatInfo,
    ...notificationInfo,
    editingEvent,
    setEditingEvent,
    resetForm,
    editEvent,
  };
};
