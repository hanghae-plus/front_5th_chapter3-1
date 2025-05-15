import { FormControl, FormLabel, Input } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleDateForm = () => {
  const { date, setDate } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>날짜</FormLabel>
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
    </FormControl>
  );
};

export default ScheduleDateForm;
