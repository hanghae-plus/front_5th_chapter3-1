import { FormControl, FormLabel, HStack, Input, Select, VStack } from '@chakra-ui/react';
import { ChangeEvent, FC } from 'react';

import { RepeatFormProps, RepeatType } from '../types/repeatFormType';

const RepeatForm: FC<RepeatFormProps> = ({
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  repeatEndDate,
  setRepeatEndDate,
}) => {
  return (
    <VStack width="100%">
      <FormControl>
        <FormLabel>반복 유형</FormLabel>
        <Select
          value={repeatType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setRepeatType(e.target.value as RepeatType)
          }
        >
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRepeatInterval(Number(e.target.value))
            }
            min={1}
          />
        </FormControl>
        <FormControl>
          <FormLabel>반복 종료일</FormLabel>
          <Input
            type="date"
            value={repeatEndDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRepeatEndDate(e.target.value)}
          />
        </FormControl>
      </HStack>
    </VStack>
  );
};

export default RepeatForm;
