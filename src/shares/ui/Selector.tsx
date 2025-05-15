import { FormControl, FormLabel, Select } from '@chakra-ui/react';

interface SelectorProps {
  label?: string;
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  defaultOption?: string;
}

const Selector = (props: SelectorProps) => {
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
