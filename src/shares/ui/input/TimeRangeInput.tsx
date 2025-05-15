import { FormControl, FormLabel, HStack, Input, Tooltip } from '@chakra-ui/react';
import React from 'react';

interface TimeRangeInputProps {
  startTime: string;
  endTime: string;
  onChangeStartTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeEndTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startTimeTooltipLabel?: string;
  endTimeTooltipLabel?: string;
  isValidStartTime: boolean;
  isValidEndTime: boolean;
  onBlur: (startTime: string, endTime: string) => void;
}

const TimeRangeInput = (props: TimeRangeInputProps) => {
  const {
    startTime,
    endTime,
    onChangeStartTime,
    onChangeEndTime,
    startTimeTooltipLabel,
    endTimeTooltipLabel,
    isValidStartTime,
    isValidEndTime,
    onBlur,
  } = props;

  return (
    <HStack width="100%">
      <FormControl>
        <FormLabel>시작 시간</FormLabel>
        <Tooltip label={startTimeTooltipLabel} isOpen={!!startTimeTooltipLabel} placement="top">
          <Input
            type="time"
            value={startTime}
            onChange={onChangeStartTime}
            onBlur={() => onBlur(startTime, endTime)}
            isInvalid={!isValidStartTime}
          />
        </Tooltip>
      </FormControl>
      <FormControl>
        <FormLabel>종료 시간</FormLabel>
        <Tooltip label={endTimeTooltipLabel} isOpen={!!endTimeTooltipLabel} placement="top">
          <Input
            type="time"
            value={endTime}
            onChange={onChangeEndTime}
            onBlur={() => onBlur(startTime, endTime)}
            isInvalid={!isValidEndTime}
          />
        </Tooltip>
      </FormControl>
    </HStack>
  );
};

export default TimeRangeInput;
