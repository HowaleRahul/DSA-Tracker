import { addDays, isBefore, startOfDay } from 'date-fns';

export const calculateNextRevision = (lastRevisedDate, confidence) => {
  const date = new Date(lastRevisedDate);
  switch (Number(confidence)) {
    case 1: return addDays(date, 2);
    case 2: return addDays(date, 3);
    case 3: return addDays(date, 5);
    case 4: return addDays(date, 7);
    case 5: return addDays(date, 10);
    default: return addDays(date, 5);
  }
};

export const needsRevision = (nextRevisionDate) => {
  const today = startOfDay(new Date());
  const revisionDay = startOfDay(new Date(nextRevisionDate));
  return isBefore(revisionDay, today) || revisionDay.getTime() === today.getTime();
};
