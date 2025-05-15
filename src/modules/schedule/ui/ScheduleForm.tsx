import { Button, Heading, HStack, VStack } from '@chakra-ui/react';

import ScheduleRepeatAlarmForm from './ScheduleRepeatAlarmForm';
import ScheduleAlarmSelectForm from '../../../features/schedule/ui/ScheduleAlarmSelectForm';
import ScheduleCategorySelectForm from '../../../features/schedule/ui/ScheduleCategorySelectForm';
import ScheduleDateForm from '../../../features/schedule/ui/ScheduleDateForm';
import ScheduleDescriptionForm from '../../../features/schedule/ui/ScheduleDescriptionForm';
import ScheduleEndTimeForm from '../../../features/schedule/ui/ScheduleEndTimeForm';
import ScheduleLocationForm from '../../../features/schedule/ui/ScheduleLocationForm';
import ScheduleRepeatForm from '../../../features/schedule/ui/ScheduleRepeatForm';
import ScheduleStartTimeForm from '../../../features/schedule/ui/ScheduleStartTimeForm';
import ScheduleTitleForm from '../../../features/schedule/ui/ScheduleTitleForm';
import { useScheduleFormContext } from '../model/ScheduleFormContext';

interface ScheduleFormProps {
  addOrUpdateEvent: () => void;
}

const ScheduleForm = ({ addOrUpdateEvent }: ScheduleFormProps) => {
  const { editingEvent, isRepeating } = useScheduleFormContext();

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <ScheduleTitleForm />
      <ScheduleDateForm />

      <HStack width="100%">
        <ScheduleStartTimeForm />
        <ScheduleEndTimeForm />
      </HStack>

      <ScheduleDescriptionForm />
      <ScheduleLocationForm />

      <ScheduleCategorySelectForm />

      <ScheduleRepeatForm />

      <ScheduleAlarmSelectForm />

      {isRepeating && <ScheduleRepeatAlarmForm />}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};

export default ScheduleForm;
