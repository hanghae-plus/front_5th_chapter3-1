/* eslint-disable no-unused-vars */
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Repeat {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

// RepeatForm props 타입 정의

export interface RepeatFormProps {
  repeatType: RepeatType;
  setRepeatType: (repeatType: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (repeatInterval: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (repeatEndDate: string) => void;
}
