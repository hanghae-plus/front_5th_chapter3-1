/* eslint-disable no-unused-vars */
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';

interface CalendarHeaderProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
}

export function CalendarHeader({ view, setView, navigate }: CalendarHeaderProps) {
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
        data-testid="prev-button"
      />
      <Select
        data-testid="view-select"
        aria-label="view"
        value={view}
        onChange={(e) => setView(e.target.value as 'week' | 'month')}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={() => navigate('next')} />
    </HStack>
  );
}
