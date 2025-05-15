import { Box, Flex, Heading, useToast, VStack } from '@chakra-ui/react';

import {
  useCalendarView,
  useEventForm,
  useEventOperations,
  useNotifications,
  useSearch,
  useDialog,
} from '@/hooks';

import { Event, EventForm as EventFormType } from '@/types';
import { findOverlappingEvents } from '@/utils';
import { Calendar, EventList, NotificationList, OverlapAlertDialog, EventForm } from '@/components';

function App() {
  const {
    formData,
    handleFormChange,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifiedEvents } = useNotifications(events);
  const { view, currentDate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const { isOverlapDialogOpen, overlappingEvents, cancelRef, openDialog, closeDialog } =
    useDialog();

  const toast = useToast({
    duration: 3000,
    isClosable: true,
  });

  const addOrUpdateEvent = async () => {
    const {
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
    } = formData;

    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
      });
      return;
    }

    const eventData: Event | EventFormType = {
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
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      openDialog(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm
          eventFormData={formData}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          onSubmit={addOrUpdateEvent}
          onFormChange={handleFormChange}
        />

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>
          <Calendar />
        </VStack>

        <EventList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          onEdit={editEvent}
          onDelete={deleteEvent}
        />
      </Flex>

      <OverlapAlertDialog
        isOpen={isOverlapDialogOpen}
        cancelRef={cancelRef}
        onClose={closeDialog}
        overlappingEvents={overlappingEvents}
        onContinue={() => {
          closeDialog();
          const {
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
          } = formData;
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
      />

      <NotificationList />
    </Box>
  );
}

export default App;
