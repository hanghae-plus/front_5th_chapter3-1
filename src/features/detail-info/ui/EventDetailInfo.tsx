import { FormControl, FormLabel, Input, Select, VStack } from '@chakra-ui/react';

import { useEventForm } from '../../../hooks/useEventForm';
import { categories } from '../constants/constants';

export const EventDetailInfo = () => {
  const { description, setDescription, location, setLocation, category, setCategory } =
    useEventForm();

  return (
    <VStack spacing={5} align="stretch">
      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>
    </VStack>
  );
};
