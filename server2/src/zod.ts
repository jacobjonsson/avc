import {ZodError} from "zod/lib/ZodError";

export function formatZodErrors<Input>(zodError: ZodError<Input>) {
  let messages: string[] = [];

  for (const error of zodError.issues) {
    if (error.code === "invalid_union") {
      // This is ugly since the typing are kind wonky in the zod library
      const expected = error.unionErrors
        .map(inner => (inner.issues[0] as any).expected)
        .join(", ");
      messages.push(`${error.path} must be on of [${expected}]`);
    } else {
      messages.push(error.message);
    }
  }

  return messages.join(", ");
}
