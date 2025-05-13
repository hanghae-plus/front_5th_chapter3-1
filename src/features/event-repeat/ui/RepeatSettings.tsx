// src/features/event-form/ui/RepeatSettings/RepeatSettings.tsx
import { VStack, HStack } from '@chakra-ui/react';

import { RepeatType } from '../../../entities/event/model/types';
import { SelectField, InputField } from '../../../shared/ui';
import { REPEAT_OPTIONS } from '../constants';

interface RepeatSettingsProps {
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  setRepeatType: (type: RepeatType) => void;
  setRepeatInterval: (interval: number) => void;
  setRepeatEndDate: (date: string) => void;
}
export const RepeatSettings = ({
  repeatType,
  repeatInterval,
  repeatEndDate,
  setRepeatType,
  setRepeatInterval,
  setRepeatEndDate,
}: RepeatSettingsProps) => {
  return (
    <VStack width="100%" spacing={4}>
      <SelectField
        label="반복 유형"
        value={repeatType}
        options={REPEAT_OPTIONS}
        onChange={(value) => setRepeatType(value as RepeatType)}
      />
      <HStack width="100%" spacing={4}>
        <InputField
          label="반복 간격"
          type="number"
          value={String(repeatInterval)}
          onChange={(value) => setRepeatInterval(Number(value))}
          min={1}
        />
        <InputField
          label="반복 종료일"
          type="date"
          value={repeatEndDate}
          onChange={(value) => setRepeatEndDate(value)}
        />
      </HStack>
    </VStack>
  );
};
