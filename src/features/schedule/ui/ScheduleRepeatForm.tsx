import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleRepeatForm = () => {
  const { isRepeating, setIsRepeating } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>반복 설정</FormLabel>
      <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
        반복 일정
      </Checkbox>
    </FormControl>
  );
};

export default ScheduleRepeatForm;
