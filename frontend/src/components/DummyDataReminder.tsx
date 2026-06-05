/** Standing data-posture reminder. Persistent and non-dismissible by design — it
 *  must still be visible deep into a session, so it is part of the always-rendered
 *  composer, not a toast or a closeable banner. */
export const DUMMY_DATA_REMINDER =
  'Use dummy/mock data only — do not enter real client information.'

export function DummyDataReminder() {
  return (
    <p
      role="note"
      className="mb-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-center text-xs text-fg-muted"
    >
      {DUMMY_DATA_REMINDER}
    </p>
  )
}
