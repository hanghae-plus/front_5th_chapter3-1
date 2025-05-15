import { Heading, VStack } from '@chakra-ui/react';

import {
  AddScheduleFrom,
  AddScheduleFromProps,
} from '@/components/organisms/schedule/add-schedule-from';

export const AddScheduleTemplate = ({
  addOrUpdateEvent,
  handleOnChangeEvent,
  eventForm,
  isEditEvent,
  startTimeError,
  endTimeError,
  isRepeating,
  setIsRepeating,
}: AddScheduleFromProps) => {
  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{isEditEvent ? '일정 수정' : '일정 추가'}</Heading>

      <AddScheduleFrom
        addOrUpdateEvent={addOrUpdateEvent}
        eventForm={eventForm}
        handleOnChangeEvent={handleOnChangeEvent}
        isEditEvent={isEditEvent}
        isRepeating={isRepeating}
        setIsRepeating={setIsRepeating}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
      />
    </VStack>
  );
};
