import { FormControl, HStack, VStack } from '@chakra-ui/react';

import { repeatOptions } from '../../constants';
import { useEventFormContext } from '../../contexts/EventFormContext';
import LabelInput from '../../shares/ui/input/LabelInput';
import Selector from '../../shares/ui/Selector';
import { RepeatType } from '../../types';

const RepeatTimeForm = () => {
  const {
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
  } = useEventFormContext();

  return (
    <VStack width="100%">
      <FormControl>
        <Selector
          label="반복 유형"
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value as RepeatType)}
          options={repeatOptions}
        />
      </FormControl>
      <HStack width="100%">
        <LabelInput
          label="반복 간격"
          value={repeatInterval}
          onChange={(value) => setRepeatInterval(Number(value))}
          type="number"
          min={1}
        />
        <LabelInput
          label="반복 종료일"
          value={repeatEndDate}
          onChange={(value) => setRepeatEndDate(value)}
          type="date"
        />
      </HStack>
    </VStack>
  );
};

export default RepeatTimeForm;
