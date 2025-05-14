import { FormControl, FormLabel, Select } from '@chakra-ui/react';

import { categories } from '../../../base/lib/categorie.constants';

interface ScheduleCategorySelectFormProps {
  category: string;
  setCategory: (category: string) => void;
}

const ScheduleCategorySelectForm = ({ category, setCategory }: ScheduleCategorySelectFormProps) => {
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
