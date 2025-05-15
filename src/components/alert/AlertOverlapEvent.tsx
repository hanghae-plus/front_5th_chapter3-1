import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogFooter,
  Button,
  Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { Event, EventForm } from '../../types';

interface AlertOverlapEventProps {
  isOpen: boolean;
  onClose: () => void;
  overlappingEvents: Event[];
  // eslint-disable-next-line no-unused-vars
  onConfirm: (eventData: Event | EventForm) => void;
  eventData: Event | EventForm;
}

export const AlertOverlapEvent = ({
  isOpen,
  onClose,
  overlappingEvents,
  onConfirm,
  eventData,
}: AlertOverlapEventProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
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
            <Button
              colorScheme="red"
              onClick={() => {
                onConfirm(eventData);
                onClose();
              }}
              ml={3}
            >
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
