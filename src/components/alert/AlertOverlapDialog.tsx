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
import { RefObject } from 'react';

import { Event } from '../../types';

interface AlertOverlapDialogProps {
  isOverlapDialogOpen: boolean;
  overlappingEvents: Event[];
  cancelRef: RefObject<HTMLButtonElement>;
  closeOverlapDialog: () => void;
  saveEvent: () => Promise<void>;
}

export const AlertOverlapDialog = ({
  isOverlapDialogOpen,
  overlappingEvents,
  cancelRef,
  closeOverlapDialog,
  saveEvent,
}: AlertOverlapDialogProps) => {
  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => closeOverlapDialog()}
    >
      <AlertDialogOverlay>
        <AlertDialogContent data-testid="overlap-dialog">
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
            <Button ref={cancelRef} onClick={() => closeOverlapDialog()}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                closeOverlapDialog();
                saveEvent();
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
