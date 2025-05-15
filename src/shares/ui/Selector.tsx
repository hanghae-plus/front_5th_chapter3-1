import { FormControl, FormLabel, Select } from '@chakra-ui/react';

const Selector = (props) => {
  const { label, value, onChange, options, defaultOption } = props;
  return (
    <FormControl>
      {label && <FormLabel>{label}</FormLabel>}
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {defaultOption && <option value="">{defaultOption}</option>}
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default Selector;
