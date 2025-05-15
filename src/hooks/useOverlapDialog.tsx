import { useCallback, useState } from 'react';

import { OverlapDialog } from '../components/OverlapDialog';
import { Event } from '../types';

interface UseOverlapDialogProps {
  onSave: () => void;
}

export const useOverlapDialog = ({ onSave }: UseOverlapDialogProps) => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const handleProceed = useCallback(() => {
    setIsOverlapDialogOpen(false);
    onSave();
  }, [onSave]);

  const openOverlapDialog = (overlapEvents: Event[]) => {
    setOverlappingEvents(overlapEvents);
    setIsOverlapDialogOpen(true);
  };

  const OverlapDialogCallback = useCallback(
    () => (
      <OverlapDialog
        overlappingEvents={overlappingEvents}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        onProceed={handleProceed}
      />
    ),
    [isOverlapDialogOpen, overlappingEvents, handleProceed]
  );

  return {
    openOverlapDialog,
    OverlapDialog: OverlapDialogCallback,
  };
};
