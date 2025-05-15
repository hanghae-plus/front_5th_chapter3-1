import { screen } from '@testing-library/react';

import { setup } from '../../../../libs/testSetup';
import CheckInput from '../../../../shares/ui/input/CheckInput';

describe('CheckInput', () => {
  it('label이 주어지면 label이 렌더링되어야 한다', () => {
    setup(<CheckInput label="Test Label" isChecked={false} onChange={() => {}} />);
    const checkbox = screen.getByRole('checkbox', { name: /Test Label/i });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('formLabel이 주어지면 FormLabel로 렌더링해야 한다', () => {
    setup(
      <CheckInput
        formLabel="Group Label"
        label="Item Label"
        isChecked={false}
        onChange={() => {}}
      />
    );

    expect(screen.getByText(/Group Label/i)).toBeInTheDocument();
  });

  it('isChecked가 true일 때 체크박스가 체크되어야 한다', () => {
    setup(<CheckInput label="Checked" isChecked={true} onChange={() => {}} />);

    expect(screen.getByRole('checkbox', { name: /Checked/i })).toBeChecked();
  });

  it('체크박스를 클릭하면 onChange가 호출되어야 한다', async () => {
    const handleChange = vi.fn();
    const { user } = setup(
      <CheckInput label="Toggle Me" isChecked={false} onChange={handleChange} />
    );
    const checkbox = screen.getByRole('checkbox', { name: /Toggle Me/i });

    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
