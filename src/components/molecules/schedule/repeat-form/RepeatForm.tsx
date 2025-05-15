import { HStack, VStack } from '@chakra-ui/react';
import React from 'react';

import { LabelInput } from '@/components/atoms/common/label-input';
import { FormSelect } from '@/components/atoms/form/select';
import { EventForm, RepeatInfo, RepeatType, ScheduleField } from '@/types';

interface RepeatFormProps {
  eventForm: EventForm;
  handleOnChangeEvent: (key: ScheduleField, value: string | number | RepeatInfo) => void;
}

export const RepeatForm = ({ eventForm, handleOnChangeEvent }: RepeatFormProps) => {
  return (
    <VStack width="100%">
      <FormSelect
        title="반복 유형"
        value={eventForm.repeat.type}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const updatedRepeat = {
            ...eventForm.repeat,
            type: e.target.value as RepeatType,
          };
          handleOnChangeEvent('repeat', updatedRepeat);
        }}
      >
        <option value="daily">매일</option>
        <option value="weekly">매주</option>
        <option value="monthly">매월</option>
        <option value="yearly">매년</option>
      </FormSelect>

      <HStack width="100%">
        <LabelInput
          title="반복 간격"
          type="number"
          value={eventForm.repeat.interval}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedRepeat = {
              ...eventForm.repeat,
              interval: Number(e.target.value),
            };
            handleOnChangeEvent('repeat', updatedRepeat);
          }}
          min={1}
        />

        <LabelInput
          title="반복 종료일"
          type="date"
          value={eventForm.repeat.endDate || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedRepeat = {
              ...eventForm.repeat,
              endDate: e.target.value,
            };
            handleOnChangeEvent('repeat', updatedRepeat);
          }}
        />
      </HStack>
    </VStack>
  );
};
