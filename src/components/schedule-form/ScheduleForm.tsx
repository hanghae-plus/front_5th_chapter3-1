import { Button, Heading, VStack } from '@chakra-ui/react';

import RepeatTimeForm from './RepeatTimeForm';
import TimeRangeInput from './TimeRangeInput';
import CheckInput from '../../shares/ui/input/CheckInput';
import LabelInput from '../../shares/ui/input/LabelInput';
import Selector from '../../shares/ui/Selector';
import { getTimeErrorMessage } from '../../utils/timeValidation';

const ScheduleForm = (props) => {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    categories,
    notificationOptions,
    editingEvent = false,
    addOrUpdateEvent,
    startTimeError,
    handleStartTimeChange,
    endTimeError,
    handleEndTimeChange,
  } = props;

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
        options={notificationOptions.map((item) => ({ value: item.value, label: item.label }))}
      />

      {isRepeating && (
        <RepeatTimeForm
          repeatType={repeatType}
          setRepeatType={setRepeatType}
          repeatInterval={repeatInterval}
          setRepeatInterval={setRepeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
        />
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};

export default ScheduleForm;
