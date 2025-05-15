import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';

import { View, viewOptions } from '../hooks/useCalendarView';

interface CalendarViewControllerProps {
  view: View;
  onViewChange: (view: View) => void;
  onPrevClick: () => void;
  onNextClick: () => void;
}

export function CalendarViewController({
  view,
  onViewChange,
  onPrevClick,
  onNextClick,
}: CalendarViewControllerProps) {
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton aria-label="Previous" icon={<ChevronLeftIcon />} onClick={onPrevClick} />
      <Select aria-label="view" value={view} onChange={(e) => onViewChange(e.target.value as View)}>
        {viewOptions.map((view) => (
          <option value={view} style={{ textTransform: 'capitalize' }}>
            {view}
          </option>
        ))}
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={onNextClick} />
    </HStack>
  );
}
