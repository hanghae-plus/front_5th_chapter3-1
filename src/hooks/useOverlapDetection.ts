import { useRef, useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseOverlapDetectionProps {
  events: Event[];
}

export function useOverlapDetection({ events }: UseOverlapDetectionProps) {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const checkEventOverlap = (eventData: Event | EventForm, editingEventId?: string): boolean => {
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      const distinctOverlappingEvents = editingEventId
        ? overlapping.filter((opEvent) => opEvent.id !== editingEventId)
        : overlapping;

      if (distinctOverlappingEvents.length > 0) {
        setOverlappingEvents(distinctOverlappingEvents);
        setIsOverlapDialogOpen(true);
        return true;
      }
    }

    return false;
  };

  return {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    cancelRef,
    checkEventOverlap,
  };
}
