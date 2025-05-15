import { Button } from '@chakra-ui/react';

import { useDialogStore } from '../../../based/store/DialogStore';
import { Event, EventForm } from '../../../types';
import { EventFormState } from '../model/useEventFormStateAndActions';

export const EventAddButton = ({
  formState,
  onSave,
}: {
  formState: EventFormState;
  onSave: (event: Event | EventForm) => void;
}) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    editingEvent,
  } = formState;

  const { setIsOverlapDialogOpen } = useDialogStore();
  return (
    <Button
      colorScheme="red"
      onClick={() => {
        setIsOverlapDialogOpen(false);
        onSave({
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
