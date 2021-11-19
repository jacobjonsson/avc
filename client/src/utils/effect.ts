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
  const effect = {
    type,
    executed: false,
    markAsExecuted() {
      effect.executed = true;
    },
    data,
  };

  return effect;
}
