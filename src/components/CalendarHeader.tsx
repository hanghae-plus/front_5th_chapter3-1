import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';
import React, { FC } from 'react';

type ViewType = 'week' | 'month';

type CalendarHeaderProps = {
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  // eslint-disable-next-line no-unused-vars
  navigate: (direction: 'prev' | 'next') => void;
};

const CalendarHeader: FC<CalendarHeaderProps> = ({ view, setView, navigate }) => {
  return (
    <HStack mx="auto" justifyContent="space-between" mb={5}>
      <IconButton
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
      />
      <Select
        data-testid="view-select"
        aria-label="view"
        value={view}
        onChange={(e) => setView(e.target.value as ViewType)}
        width="auto"
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={() => navigate('next')} />
    </HStack>
  );
};

export default CalendarHeader;
