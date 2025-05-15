import { Th, Thead, Tr } from '@chakra-ui/react';

import { weekDays } from '../../consts';

export const ViewHeader = () => {
  return (
    <Thead>
      <Tr>
        {weekDays.map((day) => (
          <Th key={day} width="14.28%">
            {day}
          </Th>
        ))}
      </Tr>
    </Thead>
  );
};
