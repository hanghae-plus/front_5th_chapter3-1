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
import React from 'react';

import { EventForm, RepeatInfo, RepeatType } from '../../../types';
import { getTimeErrorMessage } from '../../../utils/timeValidation';
const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];
interface AddScheduleTemplateProps {
  addOrUpdateEvent: () => void;
  handleOnChangeEvent: (
    key: keyof EventForm | keyof RepeatInfo,
    value: string | number | RepeatInfo
  ) => void;
  eventForm: EventForm;
  isEditEvent: boolean;
  startTimeError: string | null;
  endTimeError: string | null;
  isRepeating: boolean;
  setIsRepeating: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddScheduleTemplate = ({
  addOrUpdateEvent,
  handleOnChangeEvent,
  eventForm,
  isEditEvent,
  startTimeError,
  endTimeError,
  isRepeating,
  setIsRepeating,
}: AddScheduleTemplateProps) => {
  const categories = ['업무', '개인', '가족', '기타'];
  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{isEditEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input
          value={eventForm.title}
          onChange={(e) => handleOnChangeEvent('title', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input
          type="date"
          value={eventForm.date}
          onChange={(e) => handleOnChangeEvent('date', e.target.value)}
        />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={eventForm.startTime}
              onChange={(e) => handleOnChangeEvent('startTime', e.target.value)}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={eventForm.endTime}
              onChange={(e) => handleOnChangeEvent('endTime', e.target.value)}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input
          value={eventForm.description}
          onChange={(e) => handleOnChangeEvent('description', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input
          value={eventForm.location}
          onChange={(e) => handleOnChangeEvent('location', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select
          value={eventForm.category}
          onChange={(e) => handleOnChangeEvent('category', e.target.value)}
        >
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
          isChecked={eventForm.repeat.type !== 'none'}
          onChange={(e) => {
            const updatedRepeat = {
              ...eventForm.repeat,
              type: e.target.checked ? 'daily' : ('none' as RepeatType),
            };
            handleOnChangeEvent('repeat', updatedRepeat);
            setIsRepeating(e.target.checked);
          }}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={eventForm.notificationTime}
          onChange={(e) => handleOnChangeEvent('notificationTime', Number(e.target.value))}
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
              value={eventForm.repeat.type}
              onChange={(e) => {
                const updatedRepeat = {
                  ...eventForm.repeat,
                  type: e.target.value as RepeatType,
                };
                handleOnChangeEvent('repeat', updatedRepeat);
              }}
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
                value={eventForm.repeat.interval}
                onChange={(e) => {
                  const updatedRepeat = {
                    ...eventForm.repeat,
                    interval: Number(e.target.value),
                  };
                  handleOnChangeEvent('repeat', updatedRepeat);
                }}
                min={1}
              />
            </FormControl>
            <FormControl>
              <FormLabel>반복 종료일</FormLabel>
              <Input
                type="date"
                value={eventForm.repeat.endDate || ''}
                onChange={(e) => {
                  const updatedRepeat = {
                    ...eventForm.repeat,
                    endDate: e.target.value,
                  };
                  handleOnChangeEvent('repeat', updatedRepeat);
                }}
              />
            </FormControl>
          </HStack>
        </VStack>
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {isEditEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
