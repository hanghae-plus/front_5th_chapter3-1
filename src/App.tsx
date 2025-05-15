import { AlertDialogProvider } from './contexts/AlertDialogContext';
import { CalendarProvider } from './contexts/CalendarContext';
import { EventFormProvider } from './contexts/EventFormContext';
import { EventOperationsProvider } from './contexts/EventOperationsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { SearchProvider } from './contexts/SearchContext';
import Home from './pages/Home';

export default function App() {
  return (
    <EventFormProvider>
      <EventOperationsProvider>
        <NotificationsProvider>
          <CalendarProvider>
            <SearchProvider>
              <AlertDialogProvider>
                <Home />
              </AlertDialogProvider>
            </SearchProvider>
          </CalendarProvider>
        </NotificationsProvider>
      </EventOperationsProvider>
    </EventFormProvider>
  );
}
