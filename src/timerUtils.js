import dayjs from 'dayjs';


export const calculateMinutesUntil = (selectedTime, now = dayjs()) => {
  if (!selectedTime || !dayjs.isDayjs(selectedTime) || !selectedTime.isValid()) {
    throw new Error('Choose a valid timer time.');
  }

  const currentMinute = now.startOf('minute');
  let endTime = selectedTime.second(0).millisecond(0);

  if (endTime.isBefore(currentMinute)) {
    endTime = endTime.add(1, 'day');
  }

  return Math.max(Math.ceil(endTime.diff(now, 'minute', true)), 0);
};
