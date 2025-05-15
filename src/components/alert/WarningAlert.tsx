import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { Event, EventForm } from '../../types';

interface WarningAlertProps {
  isOverlapDialogOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  setIsOverlapDialogOpen: (isOverlapDialogOpen: boolean) => void;
  overlappingEvents: Event[];
  // eslint-disable-next-line no-unused-vars
  saveEvent: (event: Event) => void;
  editingEvent: Event | null;
  eventForm: EventForm;
  isRepeating: boolean;
}

export function WarningAlert(props: WarningAlertProps) {
  const {
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    overlappingEvents,
    saveEvent,
    editingEvent,
    eventForm,
    isRepeating,
  } = props;

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsOverlapDialogOpen(false)}
    >
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
            <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                setIsOverlapDialogOpen(false);
                saveEvent({
                  id: editingEvent ? editingEvent.id : '',
                  title: eventForm.title,
                  date: eventForm.date,
                  startTime: eventForm.startTime,
                  endTime: eventForm.endTime,
                  description: eventForm.description,
                  location: eventForm.location,
                  category: eventForm.category,
                  repeat: {
                    type: isRepeating ? eventForm.repeat.type : 'none',
                    interval: eventForm.repeat.interval,
                    endDate: eventForm.repeat.endDate || undefined,
                  },
                  notificationTime: eventForm.notificationTime,
                });
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
}
