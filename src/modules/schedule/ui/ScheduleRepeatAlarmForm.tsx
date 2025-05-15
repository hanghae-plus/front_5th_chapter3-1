import { FormControl, FormLabel, HStack, Input, Select, VStack } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';
import { RepeatType } from '../../../types';

const ScheduleRepeatAlarmForm = () => {
  const {
    repeatType,
    repeatInterval,
    repeatEndDate,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
  } = useScheduleFormContext();

  return (
    <VStack width="100%">
      <FormControl>
        <FormLabel>반복 유형</FormLabel>
        <Select value={repeatType} onChange={(e) => setRepeatType(e.target.value as RepeatType)}>
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
          <option value="yearly">매년</option>
        </Select>
      </FormControl>
      <HStack width="100%">
        <FormControl>
          <FormLabel>반복 간격</FormLabel>
          <Input
            type="number"
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(Number(e.target.value))}
            min={1}
          />
        </FormControl>
        <FormControl>
          <FormLabel>반복 종료일</FormLabel>
          <Input
            type="date"
            value={repeatEndDate}
            onChange={(e) => setRepeatEndDate(e.target.value)}
          />
        </FormControl>
      </HStack>
    </VStack>
  );
};

export default ScheduleRepeatAlarmForm;
