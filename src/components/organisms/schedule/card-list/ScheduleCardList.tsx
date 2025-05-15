import { Text } from '@chakra-ui/react';
import { Fragment } from 'react';

import { ScheduleCard } from '@/components/molecules/schedule/schedule-card';
import { Event } from '@/types';

interface ScheduleCardListProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
}

export const ScheduleCardList = ({
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: ScheduleCardListProps) => {
  if (filteredEvents.length === 0) return <Text>검색 결과가 없습니다.</Text>;

  return (
    <Fragment>
      {filteredEvents.map((event) => (
        <ScheduleCard
          event={event}
          notifiedEvents={notifiedEvents}
          handleEditEvent={editEvent}
          handleDeleteEvent={deleteEvent}
        />
      ))}
    </Fragment>
  );
};
