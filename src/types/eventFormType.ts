import { ChangeEvent } from 'react';

import { Repeat, RepeatType } from './repeatFormType';

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: Repeat;
  notificationTime: number;
}

export interface EventForm extends Omit<Event, 'id'> {
  id?: string;
}

// 컴포넌트 props 타입 정의
export interface EventFormProps {
  title: string;
  setTitle: (title: string) => void;
  date: string;
  setDate: (date: string) => void;
  startTime: string;
  endTime: string;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
  category: string;
  setCategory: (category: string) => void;
  isRepeating: boolean;
  setIsRepeating: (isRepeating: boolean) => void;
  repeatType: RepeatType;
  setRepeatType: (repeatType: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (repeatInterval: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (repeatEndDate: string) => void;
  notificationTime: number;
  setNotificationTime: (notificationTime: number) => void;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: any | null; // any 대신 실제 Event 타입 사용 가능
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}
