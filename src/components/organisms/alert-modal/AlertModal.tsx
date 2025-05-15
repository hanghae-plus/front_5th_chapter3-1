// AlertModal.tsx
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
import React, { useRef } from 'react';

import { Event } from '@/types';

interface AlertModalProps {
  isOpen: boolean;
  onCloseModal: React.Dispatch<React.SetStateAction<boolean>>;
  overlappingEvents: Event[];
  onSaveOverlapEvent: () => void;
}

export const AlertModal = ({
  isOpen,
  onCloseModal,
  overlappingEvents,
  onSaveOverlapEvent,
}: AlertModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => onCloseModal(false)}
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
            <Button ref={cancelRef} onClick={() => onCloseModal(false)}>
              취소
            </Button>
            <Button colorScheme="red" onClick={onSaveOverlapEvent} ml={3}>
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
