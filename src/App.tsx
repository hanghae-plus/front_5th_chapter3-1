import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Box, Flex, Heading, HStack, IconButton, Select, useToast } from '@chakra-ui/react';
import { useState } from 'react';

import { CalendarView } from './components/Calendar';
import { EventForm, EventFormErrors } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationPopup } from './components/NotificationPopup';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventForm } from './hooks/useEventForm';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import { useSearch } from './hooks/useSearch';
import { Event } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
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

  const handleFormChange = <K extends keyof typeof formState>(
    field: K,
    value: (typeof formState)[K]
  ) => {
    const map = {
      title: setTitle,
      date: setDate,
      startTime: handleStartTimeChange,
      endTime: handleEndTimeChange,
      description: setDescription,
      location: setLocation,
      category: setCategory,
      isRepeating: setIsRepeating,
      repeatType: setRepeatType,
      repeatInterval: setRepeatInterval,
      repeatEndDate: setRepeatEndDate,
      notificationTime: setNotificationTime,
    };
    map[field](value as never);
  };

  const formState = {
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
  };

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

    const eventData: Event = {
      id: editingEvent?.id || '',
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
        {/* 일정 폼 */}
        <Box w="400px">
          <Heading mb={4}>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>
          <EventForm
            form={formState}
            errors={{ startTimeError, endTimeError } as EventFormErrors}
            isEditing={!!editingEvent}
            onChange={handleFormChange}
            onStartTime={handleStartTimeChange}
            onEndTime={handleEndTimeChange}
            onSubmit={addOrUpdateEvent}
          />
        </Box>

        {/* 캘린더 뷰 */}
        <Box flex={1}>
          <Heading mb={4}>일정 보기</Heading>
          <HStack mb={4} justifyContent="space-between">
            <IconButton
              aria-label="이전"
              icon={<ChevronLeftIcon />}
              onClick={() => navigate('prev')}
            />
            <Select
              aria-label="보기 유형"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
              w="100px"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
            <IconButton
              aria-label="다음"
              icon={<ChevronRightIcon />}
              onClick={() => navigate('next')}
            />
          </HStack>
          <CalendarView
            view={view}
            currentDate={currentDate}
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
            holidays={holidays}
          />
        </Box>

        {/* 일정 리스트 */}
        <EventList
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          events={filteredEvents}
          onEdit={editEvent}
          onDelete={deleteEvent}
          notifiedEventIds={notifiedEvents}
        />
      </Flex>

      {/* 일정 겹침 다이얼로그 */}
      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          saveEvent({
            id: editingEvent?.id,
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
          resetForm();
        }}
      />

      {/* 알림 팝업 */}
      <NotificationPopup
        notifications={notifications}
        onClose={(index) => setNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </Box>
  );
}

export default App;
