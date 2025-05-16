import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Text,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { useEventForm } from '../hooks/useEventForm';
import { Event, EventForm } from '../types';

interface Props {
  eventForm: ReturnType<typeof useEventForm>;
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (isOverlapDialogOpen: boolean) => void;
  overlappingEvents: Event[];
  saveEvent: (event: Event | EventForm) => void;
}

export default function EventOverlapDialog({
  eventForm,
  isOverlapDialogOpen,
  setIsOverlapDialogOpen,
  overlappingEvents,
  saveEvent,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    editingEvent,
  } = eventForm;

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
                  id: editingEvent ? editingEvent.id : undefined,
                  title,
                  date,
                  startTime,
                  endTime,
                  description,
                  location,
                  category,
                  repeat: {
                    type: repeatType,
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
