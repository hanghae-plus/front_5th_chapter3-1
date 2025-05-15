import { Box, Flex, useToast } from '@chakra-ui/react';

import { AlertContainer } from '@/components/organisms/alert-container';
import { AlertModal } from '@/components/organisms/alert-modal';
import { AddScheduleTemplate } from '@/components/templates/add-schedule/AddScheduleTemplate.tsx';
import { ViewScheduleTemplate } from '@/components/templates/view-schedule';
import { useEventForm } from '@/hooks/useEventForm.ts';
import { useEventOperations } from '@/hooks/useEventOperations.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { useOverlapModal } from '@/hooks/useOverlapModal';
import { convertFormToEventData } from '@/utils/eventFormUtils';
import { findOverlappingEvents } from '@/utils/eventOverlap';

export function MainPage() {
  const {
    eventForm,
    handleOnChangeEvent,
    isRepeating,
    setIsRepeating,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    resetForm,
    editEvent,
  } = useEventForm();
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );
  const { notifications, notifiedEvents, removeNotification } = useNotifications(events);
  const { isOverlapModalOpen, overlappingEvents, openModal, closeModal, isOverlapping } =
    useOverlapModal();

  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData = convertFormToEventData(eventForm, isRepeating, editingEvent);

    if (isOverlapping(eventData, events)) {
      openModal(findOverlappingEvents(eventData, events));
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleSaveOverlapEvent = () => {
    closeModal();
    saveEvent(convertFormToEventData(eventForm, isRepeating, editingEvent));
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <AddScheduleTemplate
          addOrUpdateEvent={addOrUpdateEvent}
          handleOnChangeEvent={handleOnChangeEvent}
          eventForm={eventForm}
          isEditEvent={!!editingEvent}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
        />

        <ViewScheduleTemplate
          events={events}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Flex>

      <AlertModal
        isOpen={isOverlapModalOpen}
        onCloseModal={closeModal}
        overlappingEvents={overlappingEvents}
        onSaveOverlapEvent={handleSaveOverlapEvent}
      />
      {notifications.length > 0 && (
        <AlertContainer notifications={notifications} removeNotification={removeNotification} />
      )}
    </Box>
  );
}
