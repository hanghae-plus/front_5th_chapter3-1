import {
  FormControl,
  FormLabel,
  Input,
  Tooltip,
  Select,
  Checkbox,
  VStack,
  HStack,
  Button,
  Heading,
} from '@chakra-ui/react';
import { ChangeEvent } from 'react';

import { CATEGORIES } from '../constants/calendar';
import { NOTIFICATION_OPTIONS } from '../constants/notification';
import { RepeatType, Event } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface Props {
  editingEvent: Event | null;
  onSubmit: () => void;
  values: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    isRepeating: boolean;
    repeatType: RepeatType;
    repeatInterval: number;
    repeatEndDate: string;
    notificationTime: number;
  };
  setters: {
    setTitle: (v: string) => void;
    setDate: (v: string) => void;
    setDescription: (v: string) => void;
    setLocation: (v: string) => void;
    setCategory: (v: string) => void;
    setIsRepeating: (v: boolean) => void;
    setRepeatType: (v: RepeatType) => void;
    setRepeatInterval: (v: number) => void;
    setRepeatEndDate: (v: string) => void;
    setNotificationTime: (v: number) => void;
  };
  errors: {
    startTimeError: string | null;
    endTimeError: string | null;
  };
  handlers: {
    handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
}

const ScheduleForm = ({ editingEvent, onSubmit, values, setters, errors, handlers }: Props) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
  } = values;

  const {
    setTitle,
    setDate,
    setDescription,
    setLocation,
    setCategory,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setNotificationTime,
  } = setters;

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={errors.startTimeError} isOpen={!!errors.startTimeError}>
            <Input
              type="time"
              value={startTime}
              onChange={handlers.handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!errors.startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={errors.endTimeError} isOpen={!!errors.endTimeError}>
            <Input
              type="time"
              value={endTime}
              onChange={handlers.handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!errors.endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {NOTIFICATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {isRepeating && (
        <VStack width="100%">
          <FormControl>
            <FormLabel>반복 유형</FormLabel>
            <Select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value as RepeatType)}
            >
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
              <option value="monthly">매월</option>
              <option value="yearly">매년</option>
            </Select>
          </FormControl>
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button onClick={onSubmit} colorScheme="blue" data-testid="event-submit-button">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};

export default ScheduleForm;
