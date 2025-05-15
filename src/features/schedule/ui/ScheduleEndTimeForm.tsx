import { FormControl, FormLabel, Input, Tooltip } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';
import { getTimeErrorMessage } from '../../../utils/timeValidation';

const ScheduleEndTimeForm = () => {
  const { endTime, endTimeError, handleEndTimeChange, startTime } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>종료 시간</FormLabel>
      <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
        <Input
          type="time"
          value={endTime}
          onChange={handleEndTimeChange}
          onBlur={() => getTimeErrorMessage(startTime, endTime)}
          isInvalid={!!endTimeError}
        />
      </Tooltip>
    </FormControl>
  );
};

export default ScheduleEndTimeForm;
