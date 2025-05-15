export interface NotificationProps {
  notifications: Array<{
    message: string;
  }>;
  onClose: (index: number) => void;
}
