/* eslint-disable no-unused-vars */
import React from 'react';

import { Event, EventForm, RepeatType } from '@/entities/event/model/types';

export interface EventContextType {
  // 상태값들
  events: Event[];
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
  editingEvent: Event | null;
  startTimeError: string | null;
  endTimeError: string | null;
  overlappingEvents: Event[];
  isOverlapDialogOpen: boolean;
  // 상태 변경 함수들
  fetchEvents: () => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setTitle: (title: string) => void;
  setDate: (date: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setDescription: (desc: string) => void;
  setLocation: (location: string) => void;
  setCategory: (category: string) => void;
  setIsRepeating: (isRepeating: boolean) => void;
  setRepeatType: (type: RepeatType) => void;
  setRepeatInterval: (interval: number) => void;
  setRepeatEndDate: (date: string) => void;
  setNotificationTime: (time: number) => void;
  setEditingEvent: (event: Event | null) => void;
  setOverlappingEvents: (events: Event[]) => void;
  setIsOverlapDialogOpen: (open: boolean) => void;

  // 유틸리티 함수들
  editEvent: (event: Event) => void;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  addOrUpdateEvent: () => Promise<void>;
  saveEvent: (eventData: Event | EventForm, isEditing: boolean) => Promise<void>;
}
