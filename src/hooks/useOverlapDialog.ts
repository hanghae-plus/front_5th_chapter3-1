import { useState } from 'react';

import type { Event } from '../types';

export function useOverlapDialog() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  return { isOverlapDialogOpen, setIsOverlapDialogOpen, overlappingEvents, setOverlappingEvents };
}
