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

import { useEventFormContext } from '../../context/EventContext';
import { useEventOperationContext } from '../../context/EventOperationContext';
import { useOverlapDialogContext } from '../../context/OverlapDialogContext';

export const AlertOverlapDialog = () => {
  const { isOverlapDialogOpen, overlappingEvents, cancelRef, closeOverlapDialog } =
    useOverlapDialogContext();

  const { saveEvent } = useEventOperationContext();
  const {
    editingEvent,
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
  } = useEventFormContext();

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
