import { Button } from '@chakra-ui/react';

import { useDialogStore } from '../../../based/store/DialogStore';

export const EventAddButton = () => {
  const { isOverlapDialogOpen, setIsOverlapDialogOpen } = useDialogStore();

  return (
    <Button
      colorScheme="red"
      onClick={() => {
        setIsOverlapDialogOpen(false);
        saveEvent({
          id: editingEvent ? editingEvent.id : undefined,
          title,
          date,
          startTime,
          endTime,
          description,
          location,
          category,
          repeat: {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
          notificationTime,
        });
      }}
      ml={3}
    >
      계속 진행
    </Button>
  );
};
