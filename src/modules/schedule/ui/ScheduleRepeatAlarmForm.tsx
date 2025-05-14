import { FormControl, FormLabel, HStack, Input, Select, VStack } from '@chakra-ui/react';

import { RepeatType } from '../../../types';

interface ScheduleRepeatAlarmFormProps {
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  setRepeatType: (repeatType: RepeatType) => void;
  setRepeatInterval: (repeatInterval: number) => void;
  setRepeatEndDate: (repeatEndDate: string) => void;
}

const ScheduleRepeatAlarmForm = ({
  repeatType,
  repeatInterval,
  repeatEndDate,
  setRepeatType,
  setRepeatInterval,
  setRepeatEndDate,
}: ScheduleRepeatAlarmFormProps) => {
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
