import {
  AlertDialogFooter,
  Button,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogBody,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { useDialogStore } from '../../../based/store/DialogStore';
import { EventAddButton } from '../../../features/event';

export const OverlapDialog = () => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOverlapDialogOpen, setIsOverlapDialogOpen } = useDialogStore();

  return (
    <AlertDialog
      isOpen={isOverlapDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsOverlapDialogOpen(false)}
    >
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
            <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
              취소
            </Button>
            <EventAddButton />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
