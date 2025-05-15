/* eslint-disable no-unused-vars */
import { FormControl, FormLabel, HStack, Input, Select, VStack } from '@chakra-ui/react';

import { RepeatType } from '../../../types';

interface EventRepeatFormProps {
  repeatType: RepeatType;
  setRepeatType: (type: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (interval: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (date: string) => void;
}

export const EventRepeatForm = ({
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  repeatEndDate,
  setRepeatEndDate,
}: EventRepeatFormProps) => {
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
