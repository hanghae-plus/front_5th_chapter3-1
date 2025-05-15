import { FormControl, FormLabel, Input } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleDescriptionForm = () => {
  const { description, setDescription } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>설명</FormLabel>
      <Input value={description} onChange={(e) => setDescription(e.target.value)} />
    </FormControl>
  );
};

export default ScheduleDescriptionForm;
