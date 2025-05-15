import { Alert, AlertIcon, AlertTitle, Box, CloseButton } from '@chakra-ui/react';
interface AlertProps {
  message: string;
  onClickCloseButton: () => void;
}

export const CustomAlert = ({ message, onClickCloseButton }: AlertProps) => {
  return (
    <Alert status="info" variant="solid" width="auto">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle fontSize="sm">{message}</AlertTitle>
      </Box>
      <CloseButton onClick={onClickCloseButton} />
    </Alert>
  );
};
