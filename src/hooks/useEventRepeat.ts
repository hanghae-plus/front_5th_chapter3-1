import { useState } from 'react';

import { Event, RepeatType } from '../types';

export const useEventRepeat = (initialRepeat?: Event['repeat']) => {
  const [isRepeating, setIsRepeating] = useState(initialRepeat?.type !== 'none');
  const [repeatType, setRepeatType] = useState<RepeatType>(initialRepeat?.type || 'none');
  const [repeatInterval, setRepeatInterval] = useState(initialRepeat?.interval || 1);
  const [repeatEndDate, setRepeatEndDate] = useState(initialRepeat?.endDate || '');

  const resetRepeat = () => {
    setIsRepeating(false);
    setRepeatType('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
  };

  const setRepeatInfo = (repeat: Event['repeat']) => {
    setIsRepeating(repeat.type !== 'none');
    setRepeatType(repeat.type);
    setRepeatInterval(repeat.interval);
    setRepeatEndDate(repeat.endDate || '');
  };
  return {
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    resetRepeat,
    setRepeatInfo,
  };
};
