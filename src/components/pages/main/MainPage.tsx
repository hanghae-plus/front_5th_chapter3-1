import { Box, Flex, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { AlertContainer } from '@/components/organisms/alert-container';
import { AlertModal } from '@/components/organisms/alert-modal';
import { AddScheduleTemplate } from '@/components/templates/add-schedule/AddScheduleTemplate.tsx';
import { ViewScheduleTemplate } from '@/components/templates/view-schedule';
import { useCalendarView } from '@/hooks/useCalendarView.ts';
import { useEventForm } from '@/hooks/useEventForm.ts';
import { useEventOperations } from '@/hooks/useEventOperations.ts';
import { useNotifications } from '@/hooks/useNotifications.ts';
import { useSearch } from '@/hooks/useSearch.ts';
import { Event, EventForm } from '@/types';
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
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

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

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title: eventForm.title,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      description: eventForm.description,
      location: eventForm.location,
      category: eventForm.category,
      repeat: {
        type: isRepeating ? eventForm.repeat.type : 'none',
        interval: eventForm.repeat.interval,
        endDate: eventForm.repeat.endDate || undefined,
      },
      notificationTime: eventForm.notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleSaveOverlapEvent = () => {
    setIsOverlapDialogOpen(false);
    saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title: eventForm.title,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      description: eventForm.description,
      location: eventForm.location,
      category: eventForm.category,
      repeat: {
        type: isRepeating ? eventForm.repeat.type : 'none',
        interval: eventForm.repeat.interval,
        endDate: eventForm.repeat.endDate || undefined,
      },
      notificationTime: eventForm.notificationTime,
    });
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
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          searchTerm={searchTerm}
          navigate={navigate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
          setSearchTerm={setSearchTerm}
        />
      </Flex>

      <AlertModal
        isOpen={isOverlapDialogOpen}
        onCloseModal={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onSaveOverlapEvent={handleSaveOverlapEvent}
        ref={cancelRef}
      />
      {notifications.length > 0 && (
        <AlertContainer notifications={notifications} removeNotification={removeNotification} />
      )}
    </Box>
  );
}
