import { CheckField, SelectField } from '../../../shared/ui';
import { categories } from '../constants/constants';

interface EventOptionsProps {
  category: string;
  setCategory: (category: string) => void;
  isRepeating: boolean;
  setIsRepeating: (isRepeating: boolean) => void;
  notificationTime: number;
  setNotificationTime: (notificationTime: number) => void;
  notificationOptions: Array<{ value: number; label: string }>;
}
export const EventOptions = ({
  category,
  setCategory,
  isRepeating,
  setIsRepeating,
  notificationTime,
  setNotificationTime,
  notificationOptions,
}: EventOptionsProps) => {
  return (
    <>
      <SelectField
        label="카테고리"
        value={category}
        options={[
          { value: '', label: '카테고리 선택' },
          ...categories.map((cat) => ({ value: cat, label: cat })),
        ]}
        onChange={(value) => setCategory(value as string)}
      />

      <CheckField
        label="반복 설정"
        content="반복 일정"
        isChecked={isRepeating}
        setIsChecked={setIsRepeating}
      />

      <SelectField
        label="알림 설정"
        value={notificationTime}
        options={notificationOptions}
        onChange={(value) => setNotificationTime(value as number)}
        type="number"
      />
    </>
  );
};
