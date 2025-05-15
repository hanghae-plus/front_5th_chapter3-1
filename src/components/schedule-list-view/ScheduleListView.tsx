import { Text, VStack } from '@chakra-ui/react';

import ScheduleBox from './ScheduleBox';
import LabelInput from '../../shares/ui/input/LabelInput';

const ScheduleListView = (props) => {
  const {
    filteredEvents,
    notificationOptions,
    deleteEvent,
    editEvent,
    notifiedEvents,
    searchTerm,
    setSearchTerm,
  } = props;
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
