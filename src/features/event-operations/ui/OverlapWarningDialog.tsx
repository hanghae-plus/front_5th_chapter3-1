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

import { Event } from '../../../entities/event/model/types';

interface Props {
  isOverlapDialogOpen: boolean;
  overlappingEvents: Event[];
  onConfirm: () => void;
  onClose: () => void;
}

export function OverlapWarningDialog({
  isOverlapDialogOpen,
  overlappingEvents,
  onConfirm,
  onClose,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOverlapDialogOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
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
            <Button colorScheme="red" ml={3} onClick={onConfirm}>
              {/* onClick={() => {
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
                            }} */}
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
