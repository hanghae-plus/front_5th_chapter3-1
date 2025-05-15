import { ReactNode } from 'react';

import {
  CalendarViewContext,
  DialogContext,
  EventFormContext,
  EventOperationsContext,
  NotificationsContext,
  SearchContext,
} from '@/hooks/contexts';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useDialog } from '@/hooks/useDialog';
import { useEventForm } from '@/hooks/useEventForm';
import { useEventOperations } from '@/hooks/useEventOperations';
import { useNotifications } from '@/hooks/useNotifications';
import { useSearch } from '@/hooks/useSearch';

export const Providers = ({ children }: { children: ReactNode }) => {
  const calenderView = useCalendarView();
  const dialog = useDialog();
  const eventForm = useEventForm();
  const eventOperations = useEventOperations(Boolean(eventForm.editingEvent), () =>
    eventForm.setEditingEvent(null)
  );
  const notifications = useNotifications(eventOperations.events);
  const search = useSearch(eventOperations.events, calenderView.currentDate, calenderView.view);

  return (
    <CalendarViewContext.Provider value={calenderView}>
      <DialogContext.Provider value={dialog}>
        <EventFormContext.Provider value={eventForm}>
          <EventOperationsContext.Provider value={eventOperations}>
            <NotificationsContext.Provider value={notifications}>
              <SearchContext.Provider value={search}>
                <>{children}</>
              </SearchContext.Provider>
            </NotificationsContext.Provider>
          </EventOperationsContext.Provider>
        </EventFormContext.Provider>
      </DialogContext.Provider>
    </CalendarViewContext.Provider>
  );
};
