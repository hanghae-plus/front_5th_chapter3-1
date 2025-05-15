import { Box, Flex } from '@chakra-ui/react';

import { EventAlertDialog } from '@/features/ui/EventAlertDialog.tsx';
import { Notification } from '@/features/ui/Notification.tsx';
import { CalendarView } from '@/widgets/ui/CalendarView.tsx';
import { EventListView } from '@/widgets/ui/EventListView.tsx';
import { EventSettingView } from '@/widgets/ui/EventSettingView.tsx';

function App() {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventSettingView />
        <CalendarView />
        <EventListView />
      </Flex>
      <EventAlertDialog />
      <Notification />
    </Box>
  );
}

export default App;
