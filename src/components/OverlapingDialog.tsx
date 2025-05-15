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

import { Event } from '../types';

interface OverlapingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  overlappingEvents: Event[];
  saveEvent: (event: Event | Omit<Event, 'id'>) => void;
  editingEvent: Event | null;
}

export const OverlapingDialog = ({
  isOpen,
  onClose,
  overlappingEvents,
  saveEvent,
  editingEvent,
}: OverlapingDialogProps) => {
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
                onClose();
                saveEvent({
                  id: editingEvent ? editingEvent.id : undefined,
                  title: editingEvent?.title || '',
                  date: editingEvent?.date || '',
                  startTime: editingEvent?.startTime || '',
                  endTime: editingEvent?.endTime || '',
                  description: editingEvent?.description || '',
                  location: editingEvent?.location || '',
                  category: editingEvent?.category || '',
                  repeat: {
                    type: editingEvent?.repeat.type || 'none',
                    interval: editingEvent?.repeat.interval || 0,
                    endDate: editingEvent?.repeat.endDate || undefined,
                  },
                  notificationTime: editingEvent?.notificationTime || 0,
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
};
