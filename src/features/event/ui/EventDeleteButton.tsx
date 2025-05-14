import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';

export const EventDeleteButton = () => {
  return (
    <IconButton
      data-testid={`delete-event-button-${event.id}`}
      aria-label="Delete event"
      icon={<DeleteIcon />}
      onClick={() => deleteEvent(event.id)}
    />
  );
};
