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

import { useAlertDialogContext } from '../../contexts/AlertDialogContext';
import { useEventOperationsContext } from '../../contexts/EventOperationsContext';

const VAlertDialog = () => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen, overlappingEvents, pendingEvent, closeDialog } = useAlertDialogContext();
  const { saveEvent } = useEventOperationsContext();

  if (!pendingEvent) return null;

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={closeDialog}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((e) => (
              <Text key={e.id}>
                {e.title} ({e.date} {e.startTime}-{e.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeDialog}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                saveEvent(pendingEvent);
                closeDialog();
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

export default VAlertDialog;
