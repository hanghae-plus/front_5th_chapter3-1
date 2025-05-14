import { EditIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';

export const EventEditButton = () => {
  return (
    <IconButton
      data-testid={`edit-event-button-${event.id}`}
      aria-label="Edit event"
      icon={<EditIcon />}
      onClick={() => editEvent(event)}
    />
  );
};
