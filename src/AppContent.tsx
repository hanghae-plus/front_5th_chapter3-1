import { Box, Button, Flex, Heading, HStack, Text, useToast, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import ScheduleAlarmSelectForm from './features/schedule/ui/ScheduleAlarmSelectForm.tsx';
import ScheduleCategorySelectForm from './features/schedule/ui/ScheduleCategorySelectForm.tsx';
import ScheduleDateForm from './features/schedule/ui/ScheduleDateForm.tsx';
import ScheduleDescriptionForm from './features/schedule/ui/ScheduleDescriptionForm.tsx';
import ScheduleEndTimeForm from './features/schedule/ui/ScheduleEndTimeForm.tsx';
import ScheduleLocationForm from './features/schedule/ui/ScheduleLocationForm.tsx';
import ScheduleRepeatForm from './features/schedule/ui/ScheduleRepeatForm.tsx';
import ScheduleSearch from './features/schedule/ui/ScheduleSearch.tsx';
import ScheduleStartTimeForm from './features/schedule/ui/ScheduleStartTimeForm.tsx';
import ScheduleTitleForm from './features/schedule/ui/ScheduleTitleForm.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import CalendarViewSelect from './modules/calendar/ui/CalendarViewSelect.tsx';
import MonthCalendar from './modules/calendar/ui/MonthCalendar.tsx';
import WeekCalendar from './modules/calendar/ui/WeekCalendar.tsx';
import NotificationAlarm from './modules/notification/ui/NotificationAlarm.tsx';
import { useScheduleFormContext } from './modules/schedule/model/ScheduleFormContext.tsx';
import ScheduleDetailItem from './modules/schedule/ui/ScheduleDetailItem.tsx';
import ScheduleOverlapAlertDialog from './modules/schedule/ui/ScheduleOverlapAlertDialog.tsx';
import ScheduleRepeatAlarmForm from './modules/schedule/ui/ScheduleRepeatAlarmForm.tsx';
import { Event, EventForm } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
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
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    resetForm,
    editEvent,
  } = useScheduleFormContext();

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
        <VStack w="400px" spacing={5} align="stretch">
          <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

          <ScheduleTitleForm />
          <ScheduleDateForm />

          <HStack width="100%">
            <ScheduleStartTimeForm />
            <ScheduleEndTimeForm />
          </HStack>

          <ScheduleDescriptionForm />
          <ScheduleLocationForm />

          <ScheduleCategorySelectForm />

          <ScheduleRepeatForm />

          <ScheduleAlarmSelectForm />

          {isRepeating && <ScheduleRepeatAlarmForm />}

          <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </VStack>

        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <CalendarViewSelect view={view} setView={setView} navigate={navigate} />

          {view === 'week' && (
            <WeekCalendar
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
          {view === 'month' && (
            <MonthCalendar
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
            />
          )}
        </VStack>

        <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
          <ScheduleSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {filteredEvents.length === 0 ? (
            <Text>검색 결과가 없습니다.</Text>
          ) : (
            filteredEvents.map((event) => (
              <ScheduleDetailItem
                event={event}
                notifiedEvents={notifiedEvents}
                editEvent={editEvent}
                deleteEvent={deleteEvent}
              />
            ))
          )}
        </VStack>
      </Flex>

      <ScheduleOverlapAlertDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        clickEvent={() => {
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
      />

      {notifications.length > 0 && (
        <NotificationAlarm notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
