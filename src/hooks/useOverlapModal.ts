import { useState } from 'react';

import { Event, EventForm } from '@/types';
import { findOverlappingEvents } from '@/utils/eventOverlap';

export const useOverlapModal = () => {
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const openModal = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapModalOpen(true);
  };

  const isOverlapping = (eventFormData: Event | EventForm, events: Event[]) => {
    const result = findOverlappingEvents(eventFormData, events);
    return result.length > 0;
  };

  const closeModal = () => {
    setIsOverlapModalOpen(false);
    setOverlappingEvents([]);
  };

  return {
    isOverlapModalOpen,
    overlappingEvents,
    openModal,
    closeModal,
    isOverlapping,
  };
};
