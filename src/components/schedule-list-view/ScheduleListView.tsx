import { Text, VStack } from '@chakra-ui/react';

import ScheduleBox from './ScheduleBox';
import { notificationOptions } from '../../constants';
import { useEventFormContext } from '../../contexts/EventFormContext';
import { useEventOperationsContext } from '../../contexts/EventOperationsContext';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import { useSearchContext } from '../../contexts/SearchContext';
import LabelInput from '../../shares/ui/input/LabelInput';

const ScheduleListView = () => {
  const { filteredEvents, searchTerm, setSearchTerm } = useSearchContext();
  const { deleteEvent } = useEventOperationsContext();
  const { editEvent } = useEventFormContext();
  const { notifiedEvents } = useNotificationsContext();

  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <LabelInput
        label="일정 검색"
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="검색어를 입력하세요"
      />

      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <ScheduleBox
            key={event.id}
            event={event}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
            notifiedEvents={notifiedEvents}
            notificationOptions={notificationOptions}
          />
        ))
      )}
    </VStack>
  );
};

export default ScheduleListView;
