export interface Effect<Type extends string, Data> {
  type: Type;
  data: Data;
  executed: boolean;
  markAsExecuted(): void;
}

export function createEffect<Type extends string, Data>(
  type: Type,
  data: Data
): Effect<Type, Data> {
  return {
    type,
    executed: false,
    markAsExecuted() {
      this.executed = true;
    },
    data,
  };
}
