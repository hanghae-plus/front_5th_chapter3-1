import { FormControl, FormLabel, Input } from '@chakra-ui/react';

import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleTitleForm = () => {
  const { title, setTitle } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>제목</FormLabel>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
    </FormControl>
  );
};

export default ScheduleTitleForm;
