export type TextDiff =
  | {
      type: "insert";
      index: number;
      text: string;
    }
  | {
      type: "delete";
      index: number;
      length: number;
    }
  | {
      type: "identical";
    };

// A naive diff texting algorithm.
// It is only capable of handling pure inserts and deletes.
// Replacing strings is not handled correctly at the moment.
export function diffTexts(oldText: string, newText: string): TextDiff {
  if (oldText === newText) {
    return {type: "identical"};
  }

  if (oldText.length === 0) {
    return {
      type: "insert",
      index: 0,
      text: newText,
    };
  }

  const startIndex = findStartIndex(oldText, newText);

  let oldEndIndex = 0;
  let newEndIndex = 0;

  const newMax = newText.length - 1;
  const oldMax = oldText.length - 1;

  if (oldText.length > newText.length) {
    return {
      type: "delete",
      index: startIndex,
      length: oldText.length - newText.length,
    };
  }

  // Look right to left for the last difference
  for (let i = 0; i < newText.length; i++) {
    if (oldText.charAt(oldMax - i) !== newText.charAt(newMax - i)) {
      oldEndIndex = oldMax - i;
      newEndIndex = newMax - i;
      break;
    }
  }

  return {
    type: "insert",
    index: startIndex,
    text: newText.slice(startIndex, newEndIndex + 1),
  };
}

// This function assumes that the oldText has been checked to >= 1.
function findStartIndex(oldText: string, newText: string): number {
  for (let i = 0; i < oldText.length; i++) {
    if (oldText.charAt(i) !== newText.charAt(i)) {
      return i;
    }
  }

  return oldText.length;
}
