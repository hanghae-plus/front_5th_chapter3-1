import { FormControl, FormLabel, Select } from '@chakra-ui/react';

import { notificationOptions } from '../../../base/lib/notification.constants';
import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleAlarmSelectForm = () => {
  const { notificationTime, setNotificationTime } = useScheduleFormContext();

  return (
    <FormControl>
      <FormLabel>알림 설정</FormLabel>
      <Select
        value={notificationTime}
        onChange={(e) => setNotificationTime(Number(e.target.value))}
      >
        {notificationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default ScheduleAlarmSelectForm;
