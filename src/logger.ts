export type LogDetails = Record<string, string | number | boolean>;

export function logEvent(event: string, details: LogDetails = {}): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...details,
    }),
  );
}

export function getErrorType(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}
