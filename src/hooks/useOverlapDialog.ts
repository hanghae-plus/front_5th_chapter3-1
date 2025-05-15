import { useState, useRef } from 'react';

import { Event } from '../types'; // Event 타입 경로가 정확한지 확인 필요

export const useOverlapDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const openDialog = (conflictingEvents: Event[]) => {
    setEvents(conflictingEvents);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // setEvents([]); // 필요에 따라 기존 이벤트를 초기화 할 수 있습니다.
  };

  return {
    isOverlapDialogOpen: isOpen,
    openOverlapDialog: openDialog,
    closeOverlapDialog: closeDialog,
    overlappingEvents: events,
    overlapCancelRef: cancelRef,
  };
};
