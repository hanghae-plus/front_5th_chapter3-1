import { DeleteIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';

import { Event } from '../../../types';

export const EventDeleteButton = ({
  event,
  onDelete,
}: {
  event: Event;
  onDelete: (eventId: string) => void;
}) => {
  return (
    <IconButton
      data-testid={`delete-event-button-${event.id}`}
      aria-label="Delete event"
      icon={<DeleteIcon />}
      onClick={() => onDelete(event.id)}
    />
  );
};
