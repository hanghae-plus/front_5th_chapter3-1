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
import React, { RefObject } from 'react';

import { Event } from '../types';

interface OverlapDialogProps {
  isOverlapDialogOpen: boolean;
  closeOverlapDialog: () => void;
  handleContinueWithOverlap: () => void;
  overlappingEvents: Event[];
  cancelRef: RefObject<HTMLButtonElement>;
}

export default function OverlapDialog({
  isOverlapDialogOpen,
  closeOverlapDialog,
  handleContinueWithOverlap,
  overlappingEvents,
  cancelRef,
}: OverlapDialogProps) {
  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={closeOverlapDialog}
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
            <Button ref={cancelRef} onClick={closeOverlapDialog}>
              취소
            </Button>
            <Button colorScheme="red" onClick={handleContinueWithOverlap} ml={3}>
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
