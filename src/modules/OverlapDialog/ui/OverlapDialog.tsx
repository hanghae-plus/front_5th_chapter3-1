import {
  AlertDialogFooter,
  Button,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogBody,
  Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { EventAddButton, EventFormState } from '../../../features/event';
import { Event, EventForm } from '../../../types';

export const OverlapDialog = ({
  isOpen,
  onClose,
  overlappingEvents,
  formState,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  overlappingEvents: Event[];
  formState: EventFormState;
  onSave: (event: Event | EventForm) => void;
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay data-testid="overlap-dialog">
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              취소
            </Button>
            <EventAddButton formState={formState} onSave={onSave} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
