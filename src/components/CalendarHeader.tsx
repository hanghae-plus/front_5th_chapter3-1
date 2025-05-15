import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';

function CalendarHeader({ view, setView, navigate }) {
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
        onChange={(e) => setView(e.target.value)}
        width="auto"
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={() => navigate('next')} />
    </HStack>
  );
}

export default CalendarHeader;
