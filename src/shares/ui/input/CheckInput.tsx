import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';

const CheckInput = (props) => {
  const { formLabel, isChecked, onChange, label } = props;
  return (
    <FormControl>
      {formLabel && <FormLabel>{formLabel}</FormLabel>}
      <Checkbox isChecked={isChecked} onChange={(e) => onChange(e.target.checked)}>
        반복 일정
        {label}
      </Checkbox>
    </FormControl>
  );
};

export default CheckInput;
