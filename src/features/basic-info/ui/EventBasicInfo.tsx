import { FormControl, FormLabel, HStack, Input, VStack } from '@chakra-ui/react';

import { useEventForm } from '../../../hooks/useEventForm';

export const EventBasicInfo = () => {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    handleStartTimeChange,
    handleEndTimeChange,
    startTimeError,
    endTimeError,
  } = useEventForm();

  return (
    <VStack spacing={5} align="stretch">
      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Input
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            isInvalid={!!startTimeError}
          />
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Input
            type="time"
            value={endTime}
            onChange={handleEndTimeChange}
            isInvalid={!!endTimeError}
          />
        </FormControl>
      </HStack>
    </VStack>
  );
};
