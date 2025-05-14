import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { categories } from '../based/constants/categories.ts';
import { notificationOptions } from '../based/constants/notificationOptions.ts';
import { useDialogStore } from '../based/store/DialogStore.ts';
import { findOverlappingEvents } from '../based/utils/eventOverlap.ts';
import { getTimeErrorMessage } from '../based/utils/timeValidation.ts';
import {
  EventAddForm,
  useCalendarViewStateAndActions,
  useEventFormStateAndActions,
  useEventOperationsStateAndActions,
  useEventSubmission,
  useOverlapStateAndActions,
} from '../features/event';
import { useCalendarView } from '../hooks/useCalendarView.ts';
import { useEventForm } from '../hooks/useEventForm.ts';
import { useEventOperations } from '../hooks/useEventOperations.ts';
import { useNotifications } from '../hooks/useNotifications.ts';
import { useSearch } from '../hooks/useSearch.ts';
import { EventCalendar, MonthView, WeekView } from '../modules/EventCalendar';
import { EventList } from '../modules/EventList';
import { Notifications } from '../modules/Notifications';
import { OverlapDialog } from '../modules/OverlapDialog';
import { Event, EventForm } from '../types';

export const EventManagerPage = () => {
  const { formState, formActions } = useEventFormStateAndActions();
  const { operationsState, operationsActions } = useEventOperationsStateAndActions(
    formState.editingEvent,
    () => formActions.setEditingEvent(null)
  );
  const { viewState, viewActions } = useCalendarViewStateAndActions(operationsState.events);
  const { isOverlapDialogOpen, setIsOverlapDialogOpen } = useDialogStore();
  const { overlapActions } = useOverlapStateAndActions();
  const { addOrUpdateEvent } = useEventSubmission(
    formState,
    formActions,
    operationsState,
    operationsActions,
    overlapActions
  );

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventAddForm formState={formState} formActions={formActions} onSubmit={addOrUpdateEvent} />
        <EventCalendar
          viewState={viewState}
          viewActions={viewActions}
          events={operationsState.events}
        />
        <EventList
          events={operationsState.events}
          searchTerm={viewState.searchTerm}
          onSearch={viewActions.setSearchTerm}
        />
      </Flex>

      <OverlapDialog isOpen={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)} />

      <Notifications
        notifications={operationsState.notifications}
        notifiedEvents={operationsState.notifiedEvents}
      />
    </Box>
  );
};
