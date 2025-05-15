import { Button, HStack } from '@chakra-ui/react';
import React, { Fragment } from 'react';

import { LabelInput } from '@/components/atoms/common/label-input';
import { FormCheckbox } from '@/components/atoms/form/checkbox';
import { FormSelect } from '@/components/atoms/form/select';
import { FormTimeInput } from '@/components/atoms/form/time-input';
import { RepeatForm } from '@/components/molecules/schedule/repeat-form';
import { NOTIFICATION_OPTIONS } from '@/constants/notification';
import { EventForm, RepeatInfo, RepeatType, ScheduleField } from '@/types';
import { getTimeErrorMessage } from '@/utils/timeValidation';

export interface AddScheduleFromProps {
  addOrUpdateEvent: () => void;
  eventForm: EventForm;
  handleOnChangeEvent: (key: ScheduleField, value: string | number | RepeatInfo) => void;
  startTimeError: string | null;
  endTimeError: string | null;
  isRepeating: boolean;
  setIsRepeating: React.Dispatch<React.SetStateAction<boolean>>;
  isEditEvent: boolean;
}

export const AddScheduleFrom: React.FC<AddScheduleFromProps> = ({
  addOrUpdateEvent,
  eventForm,
  handleOnChangeEvent,
  startTimeError,
  endTimeError,
  isRepeating,
  setIsRepeating,
  isEditEvent,
}) => {
  const CATEGORIES = ['업무', '개인', '가족', '기타'];

  return (
    <Fragment>
      <LabelInput
        title="제목"
        value={eventForm.title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleOnChangeEvent('title', e.target.value)
        }
      />
      <LabelInput
        title="날짜"
        value={eventForm.date}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleOnChangeEvent('date', e.target.value)
        }
      />

      <HStack width="100%">
        <FormTimeInput
          title="시작 시간"
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          value={eventForm.startTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleOnChangeEvent('startTime', e.target.value)
          }
          onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
          isInvalid={!!startTimeError}
        />
        <FormTimeInput
          title="종료 시간"
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          value={eventForm.endTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleOnChangeEvent('endTime', e.target.value)
          }
          onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
          isInvalid={!!endTimeError}
        />
      </HStack>

      <LabelInput
        title="설명"
        value={eventForm.description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleOnChangeEvent('description', e.target.value)
        }
      />

      <LabelInput
        title="위치"
        value={eventForm.location}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleOnChangeEvent('location', e.target.value)
        }
      />

      <FormSelect
        title="카테고리"
        value={eventForm.category}
        onChange={(e) => handleOnChangeEvent('category', e.target.value)}
      >
        <option value="">카테고리 선택</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </FormSelect>

      <FormCheckbox
        title="반복 설정"
        description="반복 일정"
        isChecked={eventForm.repeat.type !== 'none'}
        onChange={(e) => {
          const updatedRepeat = {
            ...eventForm.repeat,
            type: e.target.checked ? 'daily' : ('none' as RepeatType),
          };
          handleOnChangeEvent('repeat', updatedRepeat);
          setIsRepeating(e.target.checked);
        }}
      />

      <FormSelect
        title="알림 설정"
        value={eventForm.notificationTime}
        onChange={(e) => handleOnChangeEvent('notificationTime', Number(e.target.value))}
      >
        {NOTIFICATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>

      {isRepeating && (
        <RepeatForm eventForm={eventForm} handleOnChangeEvent={handleOnChangeEvent} />
      )}

      <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
        {isEditEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Fragment>
  );
};
