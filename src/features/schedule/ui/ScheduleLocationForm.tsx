import { FormControl, FormLabel, Input } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleLocationForm = () => {
  const { location, setLocation } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>위치</FormLabel>
      <Input value={location} onChange={(e) => setLocation(e.target.value)} />
    </FormControl>
  );
};
export default ScheduleLocationForm;
