import AppContent from './AppContent';
import { ScheduleFormProvider } from './modules/schedule/model/ScheduleFormContext';

const App = () => {
  return (
    <ScheduleFormProvider>
      <AppContent />
    </ScheduleFormProvider>
  );
};

export default App;
