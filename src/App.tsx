import { EventFormProvider } from './contexts/event-form-context';
import EventManagePage from './pages/EventManagePage';

function App() {
  return (
    <EventFormProvider>
      <EventManagePage />
    </EventFormProvider>
  );
}

export default App;
