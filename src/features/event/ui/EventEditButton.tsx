import { EditIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';

import { Event } from '../../../types';

export const EventEditButton = ({
  event,
  editEvent,
}: {
  event: Event;
  editEvent: (event: Event) => void;
}) => {
  return (
    <IconButton
      data-testid={`edit-event-button-${event.id}`}
      aria-label="Edit event"
      icon={<EditIcon />}
      onClick={() => editEvent(event)}
    />
  );
};
