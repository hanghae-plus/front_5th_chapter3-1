import { useInterval } from '@chakra-ui/react';
import { useState, useCallback, useEffect, useRef } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

// isTest 파라미터 추가: 테스트 환경에서는 true로 전달하여 자동 실행 비활성화
export const useNotifications = (events: Event[], isTest = false) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);
  const isFirstRun = useRef(true);

  // 테스트 환경에서 초기화할 수 있는 방법 제공
  const resetNotifications = useCallback(() => {
    setNotifications([]);
    setNotifiedEvents([]);
  }, []);

  // useCallback으로 감싸 함수 참조 안정성 확보
  const checkUpcomingEvents = useCallback(() => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    if (upcomingEvents.length > 0) {
      const newNotifications = upcomingEvents.map((event) => ({
        id: event.id,
        message: createNotificationMessage(event),
      }));

      setNotifications((prev) => [...prev, ...newNotifications]);
      setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map((event) => event.id)]);
    }
  }, [events, notifiedEvents]);

  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 테스트 모드가 아닐 때만 자동 실행
  if (!isTest) {
    useInterval(checkUpcomingEvents, 1000); // 1초마다 체크
  } else if (isTest && isFirstRun.current) {
    // 테스트 모드에서는 컴포넌트 마운트 시 딱 한 번만 실행
    isFirstRun.current = false;
    
    // 테스트에서는 자동으로 한 번 체크하지 않음
    // 대신 테스트에서 수동으로 checkUpcomingEvents 호출
  }

  return { 
    notifications, 
    notifiedEvents, 
    removeNotification,
    checkUpcomingEvents, // 테스트를 위해 노출
    resetNotifications, // 테스트를 위해 노출
  };
};