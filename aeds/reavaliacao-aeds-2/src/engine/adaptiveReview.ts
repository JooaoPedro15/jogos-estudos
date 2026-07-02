import { reviewVariations } from '../content/reviewVariations';
import type { PracticeVariation } from '../types/content';
import type { ErrorNotebook, ErrorRecord, StepAttempt } from '../types/progress';

const RESOLVED_STREAK_TARGET = 2;

export function createEmptyNotebook(): ErrorNotebook {
  return { records: [] };
}

export function recordStepAttempt(
  notebook: ErrorNotebook,
  attempt: StepAttempt,
  seenAt = new Date().toISOString(),
): ErrorNotebook {
  if (attempt.correct || !attempt.mistakeTag) {
    return notebook;
  }

  const id = buildErrorRecordId(attempt);
  const existingRecord = notebook.records.find((record) => record.id === id);

  if (!existingRecord) {
    return {
      records: [
        ...notebook.records,
        {
          id,
          challengeId: attempt.stepId,
          domainId: attempt.domainId,
          skillId: attempt.skillId,
          questionFormat: attempt.format,
          mistakeTag: attempt.mistakeTag,
          attempts: 1,
          lastSeenAt: seenAt,
          resolvedStreak: 0,
          resolved: false,
        },
      ],
    };
  }

  return updateRecord(notebook, id, {
    ...existingRecord,
    challengeId: attempt.stepId,
    attempts: existingRecord.attempts + 1,
    lastSeenAt: seenAt,
    resolvedStreak: 0,
    resolved: false,
  });
}

export function getPriorityErrors(notebook: ErrorNotebook): ErrorRecord[] {
  return [...notebook.records]
    .filter((record) => !record.resolved)
    .sort((left: ErrorRecord, right: ErrorRecord) => {
      if (right.attempts !== left.attempts) {
        return right.attempts - left.attempts;
      }

      return new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime();
    });
}

export function recordReviewResult(
  notebook: ErrorNotebook,
  recordId: string,
  correct: boolean,
  seenAt = new Date().toISOString(),
): ErrorNotebook {
  const record = notebook.records.find((item) => item.id === recordId);

  if (!record) {
    return notebook;
  }

  if (!correct) {
    return updateRecord(notebook, recordId, {
      ...record,
      attempts: record.attempts + 1,
      lastSeenAt: seenAt,
      resolvedStreak: 0,
      resolved: false,
    });
  }

  const resolvedStreak = record.resolvedStreak + 1;

  return updateRecord(notebook, recordId, {
    ...record,
    lastSeenAt: seenAt,
    resolvedStreak,
    resolved: resolvedStreak >= RESOLVED_STREAK_TARGET,
  });
}

export function selectSimilarPractice(
  record: ErrorRecord,
  variations: PracticeVariation[] = reviewVariations,
): PracticeVariation | undefined {
  return (
    variations.find(
      (variation) =>
        variation.domainId === record.domainId && variation.targetMistakeTag === record.mistakeTag,
    ) ?? variations.find((variation) => variation.targetMistakeTag === record.mistakeTag)
  );
}

function buildErrorRecordId(attempt: StepAttempt): string {
  return `${attempt.domainId}:${attempt.skillId}:${attempt.format}:${attempt.mistakeTag}`;
}

function updateRecord(notebook: ErrorNotebook, recordId: string, updatedRecord: ErrorRecord): ErrorNotebook {
  return {
    records: notebook.records.map((record) => (record.id === recordId ? updatedRecord : record)),
  };
}
