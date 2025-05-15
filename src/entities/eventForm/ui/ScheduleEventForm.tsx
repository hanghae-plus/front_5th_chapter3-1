import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Tooltip,
  Select,
  Checkbox,
  Button,
} from '@chakra-ui/react';
import React from 'react';

import { getTimeErrorMessage } from '@/shared/lib/timeValidation';
import { RepeatType } from '@/types';

type Props = {
  formState: {
    title: string;
    setTitle: (_value: string) => void;
    date: string;
    setDate: (__value: string) => void;
    startTime: string;
    endTime: string;
    startTimeError?: string | null;
    endTimeError?: string | null;
    handleStartTimeChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
    handleEndTimeChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
    description: string;
    setDescription: (_value: string) => void;
    location: string;
    setLocation: (_value: string) => void;
    category: string;
    setCategory: (_value: string) => void;
    isRepeating: boolean;
    setIsRepeating: (_v: boolean) => void;
    repeatType: RepeatType;
    setRepeatType: (_v: RepeatType) => void;
    repeatInterval: number;
    setRepeatInterval: (_v: number) => void;
    repeatEndDate: string;
    setRepeatEndDate: (_value: string) => void;
    notificationTime: number;
    setNotificationTime: (_v: number) => void;
    editingEvent: any;
  };
  onSubmit: () => void;
  notificationOptions: { value: number; label: string }[];
};

const ScheduleEventForm = ({ formState, onSubmit, notificationOptions }: Props) => {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
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
    editingEvent,
  } = formState;

  const categories = ['업무', '개인', '가족', '기타'];

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
          {categories.map((cat) => (
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

      <Button data-testid="event-submit-button" onClick={onSubmit} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};

export default ScheduleEventForm;
