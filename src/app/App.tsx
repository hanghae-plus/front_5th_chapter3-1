// src/app/App.tsx
import { EventProvider } from './providers/EventProvider';
import CalendarPage from '../pages/CalendarPage';

export default function App() {
  return (
    <EventProvider>
      <CalendarPage />
    </EventProvider>
  );
}
