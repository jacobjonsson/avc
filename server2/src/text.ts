import {Mutation} from "./domain/mutation";

export function calculateText(mutations: Mutation[]): string {
  let text = "";

  for (const mutation of mutations) {
    if (mutation.type === "insert") {
      let start = text.slice(0, mutation.index);
      let end = text.slice(mutation.index);
      text = start + mutation.text + end;
      continue;
    }

    if (mutation.type === "delete") {
      let start = text.slice(0, mutation.index);
      let end = text.slice(mutation.index + mutation.length);
      text = start + end;
      continue;
    }
  }

  return text;
}
