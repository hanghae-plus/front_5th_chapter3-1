import { ChangeEvent, useState } from 'react';

import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventTime = (initialStartTime = '', initialEndTime = '') => {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetTime = () => {
    setStartTime('');
    setEndTime('');
    setTimeError({ startTimeError: null, endTimeError: null });
  };

  const setEventTime = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    setTimeError(getTimeErrorMessage(start, end));
  };

  return {
    startTime,
    endTime,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetTime,
    setEventTime,
  };
};
