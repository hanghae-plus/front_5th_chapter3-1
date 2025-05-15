import { Box, Flex } from '@chakra-ui/react';

import { useDialogStore } from '../based/store/DialogStore.ts';
import {
  EventAddForm,
  useCalendarViewStateAndActions,
  useEventFormStateAndActions,
  useEventOperationsStateAndActions,
  useEventSubmission,
  useOverlapStateAndActions,
} from '../features/event';
import { EventCalendar } from '../modules/EventCalendar/index.ts';
import { EventList } from '../modules/EventList/index.ts';
import { Notifications } from '../modules/Notifications';
import { OverlapDialog } from '../modules/OverlapDialog';

export const EventManagerPage = () => {
  const { formState, formActions } = useEventFormStateAndActions();
  const { operationsState, operationsActions } = useEventOperationsStateAndActions(
    formState.editingEvent,
    () => formActions.setEditingEvent(null)
  );
  const { viewState, viewActions } = useCalendarViewStateAndActions(operationsState.events);
  const { isOverlapDialogOpen, setIsOverlapDialogOpen } = useDialogStore();
  const { overlapState, overlapActions } = useOverlapStateAndActions();
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
          notifiedEvents={operationsState.notifiedEvents}
        />
        <EventList
          searchTerm={viewState.searchTerm}
          onSearch={viewActions.setSearchTerm}
          filteredEvents={viewState.filteredEvents}
          notifiedEvents={operationsState.notifiedEvents}
          onEdit={formActions.editEvent}
          onDelete={operationsActions.deleteEvent}
        />
      </Flex>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlapState.overlappingEvents}
        formState={formState}
        onSave={operationsActions.saveEvent}
      />

      <Notifications
        notifications={operationsState.notifications}
        setNotifications={operationsActions.setNotifications}
      />
    </Box>
  );
};
