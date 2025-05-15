import { Box, Flex } from '@chakra-ui/react';

import { Calander, AlertOverlapDialog } from './components';
import { AlertNotification } from './components/alert/AlertNotification.tsx';
import { EventForm } from './components/event/EventForm.tsx';
import { EventSearch } from './components/event/EventSearch.tsx';

function App() {
  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm />
        <Calander />
        <EventSearch />
      </Flex>
      <AlertOverlapDialog />
      <AlertNotification />
    </Box>
  );
}

export default App;
