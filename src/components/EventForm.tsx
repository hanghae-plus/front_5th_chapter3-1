import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import { Event, RepeatType } from '@/types';
import { getTimeErrorMessage } from '@/utils';
import { categories, notificationOptions } from '@/lib';

export interface EventFormData {
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
}

interface EventFormProps {
  eventFormData: EventFormData;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onFormChange: (field: keyof EventFormData, value: any) => void;
}

export const EventForm = ({
  eventFormData,
  startTimeError,
  endTimeError,
  editingEvent,
  handleStartTimeChange,
  handleEndTimeChange,
  onSubmit,
  onFormChange,
}: EventFormProps) => {
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
  } = eventFormData;

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => onFormChange('title', e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input type="date" value={date} onChange={(e) => onFormChange('date', e.target.value)} />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => onFormChange('description', e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => onFormChange('location', e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => onFormChange('category', e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox
          isChecked={isRepeating}
          onChange={(e) => onFormChange('isRepeating', e.target.checked)}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => onFormChange('notificationTime', Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
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
              onChange={(e) => onFormChange('repeatType', e.target.value as RepeatType)}
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
                onChange={(e) => onFormChange('repeatInterval', Number(e.target.value))}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => onFormChange('repeatEndDate', e.target.value)}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={onSubmit} colorScheme="blue" py={5}>
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
