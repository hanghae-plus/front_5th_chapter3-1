import { Button, Heading, VStack } from '@chakra-ui/react';

import RepeatTimeForm from './RepeatTimeForm';
import { useEventFormContext } from '../../contexts/EventFormContext';
import { notificationOptions, categories } from '../../constants';
import CheckInput from '../../shares/ui/input/CheckInput';
import LabelInput from '../../shares/ui/input/LabelInput';
import TimeRangeInput from '../../shares/ui/input/TimeRangeInput';
import Selector from '../../shares/ui/Selector';
import { getTimeErrorMessage } from '../../utils/timeValidation';

interface ScheduleFormProps {
  editingEvent?: boolean;
  addOrUpdateEvent: () => Promise<void>;
}

const ScheduleForm = ({ editingEvent = false, addOrUpdateEvent }: ScheduleFormProps) => {
  const {
    title,
    setTitle,
    date,
    setDate,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    notificationTime,
    setNotificationTime,
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
  } = useEventFormContext();

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <LabelInput value={title} onChange={setTitle} label="제목" />
      <LabelInput value={date} onChange={setDate} label="날짜" type="date" />

      <TimeRangeInput
        startTime={startTime}
        endTime={endTime}
        startTimeTooltipLabel={startTimeError}
        endTimeTooltipLabel={endTimeError}
        isValidStartTime={!startTimeError}
        isValidEndTime={!endTimeError}
        onBlur={getTimeErrorMessage}
        onChangeStartTime={handleStartTimeChange}
        onChangeEndTime={handleEndTimeChange}
      />

      <LabelInput value={description} onChange={setDescription} label="설명" />
      <LabelInput value={location} onChange={setLocation} label="위치" />

      <Selector
        label="카테고리"
        value={category}
        onChange={setCategory}
        options={categories.map((item) => ({ value: item, label: item }))}
        defaultOption="카테고리 선택"
      />

      <CheckInput
        formLabel="반복 설정"
        isChecked={isRepeating}
        onChange={setIsRepeating}
        label="반복 일정"
      />

      <Selector
        label="알림 설정"
        value={notificationTime}
        onChange={(v) => setNotificationTime(Number(v))}
        options={notificationOptions.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />

      {isRepeating && <RepeatTimeForm />}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};

export default ScheduleForm;
