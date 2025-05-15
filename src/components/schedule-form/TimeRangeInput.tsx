import { FormControl, FormLabel, HStack, Input, Tooltip } from '@chakra-ui/react';

const TimeRangeInput = (props) => {
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
