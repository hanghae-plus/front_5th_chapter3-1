import { screen, fireEvent } from '@testing-library/react';

import { setup } from '../../../libs/testSetup';
import Selector from '../../../shares/ui/Selector';

describe('Selector', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];
  const defaultOptionLabel = 'Please choose';

  it('label이 주어지면 label이 렌더링되어야 한다', () => {
    setup(<Selector label="Test Selector" value="" onChange={() => {}} options={options} />);

    expect(screen.getByText('Test Selector')).toBeInTheDocument();
  });

  it('defaultOption이 주어지면 defaultOption이 렌더링되어야 한다', () => {
    setup(
      <Selector
        label="With Default"
        value=""
        onChange={() => {}}
        options={options}
        defaultOption={defaultOptionLabel}
      />
    );
    const select = screen.getByRole('combobox', { name: /With Default/i });

    expect(select).toHaveDisplayValue(defaultOptionLabel);
    expect(screen.getByRole('option', { name: defaultOptionLabel })).toBeInTheDocument();
  });

  it('주어진 options이 렌더링되어야 한다', () => {
    setup(
      <Selector
        label="All Options"
        value=""
        onChange={() => {}}
        options={options}
        defaultOption={defaultOptionLabel}
      />
    );
    options.forEach((option) => {
      expect(screen.getByRole('option', { name: option.label })).toBeInTheDocument();
    });
  });

  it('value가 주어지면 해당 value에 맞는 옵션이 선택되어야 한다', () => {
    setup(<Selector label="Selected" value="b" onChange={() => {}} options={options} />);
    const select = screen.getByRole('combobox', { name: /Selected/i });

    expect(select).toHaveDisplayValue('Option B');
  });

  it('옵션을 선택하면 onChange가 호출되어야 한다', () => {
    const handleChange = vi.fn();
    setup(<Selector label="Change Me" value="a" onChange={handleChange} options={options} />);
    const select = screen.getByRole('combobox', { name: /Change Me/i });

    fireEvent.change(select, { target: { value: 'c' } });
    expect(handleChange).toHaveBeenCalledWith('c');

    fireEvent.change(select, { target: { value: 'b' } });
    expect(handleChange).toHaveBeenCalledWith('b');
  });
});
