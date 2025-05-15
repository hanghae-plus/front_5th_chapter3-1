import { ChangeEvent } from 'react';

import { TimeSettings } from '../../../features/time-setting/ui/TimeSettings';
import { InputField } from '../../../shared/ui';

interface EventInfoProps {
  title: string;
  setTitle: (title: string) => void;
  date: string;
  setDate: (date: string) => void;
  startTime: string;
  endTime: string;
  endTimeError: string | null;
  startTimeError: string | null;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
}
export const EventInfo = ({
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
}: EventInfoProps) => {
  return (
    <>
      <InputField label="제목" value={title} onChange={setTitle} />

      <InputField label="날짜" value={date} onChange={setDate} type="date" />

      {/* 시간 분리 */}
      <TimeSettings
        startTime={startTime}
        endTime={endTime}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
      />

      <InputField label="설명" value={description} onChange={setDescription} />

      <InputField label="위치" value={location} onChange={setLocation} />
    </>
  );
};
