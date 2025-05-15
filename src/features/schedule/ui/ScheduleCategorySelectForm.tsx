import { FormControl, FormLabel, Select } from '@chakra-ui/react';

import { categories } from '../../../base/lib/categorie.constants';
import { useScheduleFormContext } from '../../../modules/schedule/model/ScheduleFormContext';

const ScheduleCategorySelectForm = () => {
  const { category, setCategory } = useScheduleFormContext();

  return (
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
  );
};

export default ScheduleCategorySelectForm;
