import { FormControl, FormLabel, Input, Tooltip } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';
import { getTimeErrorMessage } from '../../../utils/timeValidation';

const ScheduleStartTimeForm = () => {
  const { startTime, startTimeError, handleStartTimeChange, endTime } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>시작 시간</FormLabel>
      <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
        <Input
          type="time"
          value={startTime}
          onChange={handleStartTimeChange}
          onBlur={() => getTimeErrorMessage(startTime, endTime)}
          isInvalid={!!startTimeError}
        />
      </Tooltip>
    </FormControl>
  );
};

export default ScheduleStartTimeForm;
