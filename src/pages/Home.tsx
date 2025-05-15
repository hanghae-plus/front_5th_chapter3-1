import { Box, Flex, useToast } from '@chakra-ui/react';

import VAlertDialog from '../components/alert/AlertDialog';
import CalendarView from '../components/calendar-view/CalendarView';
import NotificationStack from '../components/notification/NotificationStack';
import ScheduleForm from '../components/schedule-form/ScheduleForm';
import ScheduleListView from '../components/schedule-list-view/ScheduleListView';
import { useAlertDialogContext } from '../contexts/AlertDialogContext';
import { useEventFormContext } from '../contexts/EventFormContext';
import { useEventOperationsContext } from '../contexts/EventOperationsContext';
import { findOverlappingEvents } from '../utils/eventOverlap';

const Home = () => {
  const toast = useToast();
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
    resetForm,
    editingEvent,
  } = useEventFormContext();
  const { events, saveEvent } = useEventOperationsContext();
  const { openDialog } = useAlertDialogContext();

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

    const newEvent = {
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
    };

    const overlapping = findOverlappingEvents(newEvent, events);
    if (overlapping.length > 0) {
      openDialog(newEvent, overlapping);
    } else {
      await saveEvent(newEvent);
      resetForm();
    }
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <ScheduleForm editingEvent={!!editingEvent} addOrUpdateEvent={addOrUpdateEvent} />
        <CalendarView />
        <ScheduleListView />
      </Flex>

      <VAlertDialog />
      <NotificationStack />
    </Box>
  );
};

export default Home;
