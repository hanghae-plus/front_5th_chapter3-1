import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
  Button,
} from '@chakra-ui/react';
import { RefObject } from 'react';

import { Event, EventForm, RepeatType } from '../../../entities/event/model/types';

interface AlertWidgetProps {
  isOverlapDialogOpen: boolean;
  cancelRef: RefObject<HTMLButtonElement>;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  overlappingEvents: Event[];
  saveEvent: (event: Event | EventForm) => void;
  editingEvent: Event | null;
  eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    isRepeating: boolean;
    repeatType: RepeatType;
    repeatInterval: number;
    repeatEndDate: string;
    notificationTime: number;
  };
}

export const AlertWidget = ({
  isOverlapDialogOpen,
  cancelRef,
  setIsOverlapDialogOpen,
  overlappingEvents,
  saveEvent,
  editingEvent,
  eventData: {
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
  },
}: AlertWidgetProps) => {
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
