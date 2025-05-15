import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, HStack, IconButton, Select, useToast, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { findOverlappingEvents } from '../../entities/event/lib/eventOverlap.ts';
import { Event, EventForm } from '../../entities/event/model/types.ts';
import { useEventOperations } from '../../features/event-operations/model/useEventOperations.ts';
import { useNotifications } from '../../features/event-operations/model/useNotifications.ts';
import { NotificationToast } from '../../features/event-operations/ui/NotificationToast.tsx';
import { OverlapWarningDialog } from '../../features/event-operations/ui/OverlapWarningDialog.tsx';
import { useCalendarView } from '../../features/event-viewer/model/useCalendarView.ts';
import { MonthView } from '../../features/event-viewer/ui/MonthView.tsx';
import { WeekView } from '../../features/event-viewer/ui/WeekView.tsx';
import { useEventForm } from '../../features/events-form/model/useEventForm.ts';
import { EventFormView } from '../../features/events-form/ui/EventForm.tsx';
import { useSearch } from '../../features/search/model/useSearch.ts';
import { EventList } from '../../widgets/event-list/ui/EventList.tsx';

export function SchedulerPage() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
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

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
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
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventFormView
          title={title}
          date={date}
          startTime={startTime}
          startTimeError={startTimeError}
          endTime={endTime}
          endTimeError={endTimeError}
          description={description}
          location={location}
          category={category}
          notificationTime={notificationTime}
          repeatType={repeatType}
          repeatInterval={repeatInterval}
          repeatEndDate={repeatEndDate}
          editingEvent={editingEvent}
          isRepeating={isRepeating}
          addOrUpdateEvent={addOrUpdateEvent}
          setTitle={setTitle}
          setDate={setDate}
          setDescription={setDescription}
          setLocation={setLocation}
          setCategory={setCategory}
          setIsRepeating={setIsRepeating}
          setNotificationTime={setNotificationTime}
          setRepeatType={setRepeatType}
          setRepeatInterval={setRepeatInterval}
          setRepeatEndDate={setRepeatEndDate}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
        ></EventFormView>

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <HStack mx="auto" justifyContent="space-between">
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon />}
              onClick={() => navigate('prev')}
            />
            <Select
              data-testid="view-select"
              aria-label="view"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon />}
              onClick={() => navigate('next')}
            />
          </HStack>

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              isNotified={(event) => notifiedEvents.includes(event.id)}
            ></WeekView>
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              isNotified={(event) => notifiedEvents.includes(event.id)}
              holidays={holidays}
            ></MonthView>
          )}
        </VStack>

        <EventList
          filteredEvents={filteredEvents}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          notifiedEvents={notifiedEvents}
          onEdit={editEvent}
          onDelete={deleteEvent}
        ></EventList>
      </Flex>

      <OverlapWarningDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={() => {
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
        }}
      ></OverlapWarningDialog>

      <NotificationToast
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      ></NotificationToast>
    </Box>
  );
}
