import {diffTexts, TextDiff} from "./text";

interface TestCase {
  diff: TextDiff;
  oldText: string;
  newText: string;
}

const testCases: TestCase[] = [
  {
    oldText: "",
    newText: "",
    diff: {type: "identical"},
  },
  {
    oldText: "",
    newText: "a",
    diff: {
      type: "insert",
      index: 0,
      text: "a",
    },
  },
  {
    oldText: "hello",
    newText: "hello world",
    diff: {
      type: "insert",
      index: 5,
      text: " world",
    },
  },
  {
    oldText: "abc",
    newText: "defabc",
    diff: {
      type: "insert",
      index: 0,
      text: "def",
    },
  },
  {
    oldText: "abc",
    newText: "adbecg",
    diff: {
      type: "insert",
      index: 1,
      text: "dbecg",
    },
  },
  {
    oldText: "abcdef",
    newText: "abc",
    diff: {
      type: "delete",
      index: 3,
      length: 3,
    },
  },
  {
    oldText: "The house is red",
    newText: "The is red",
    diff: {
      type: "delete",
      index: 4,
      length: 6,
    },
  },
  {
    oldText: "The house is red",
    newText: "The house is red",
    diff: {
      type: "identical",
    },
  },
  // This does not work since it's a pure replacement.
  // {
  //   oldText: "The house is red",
  //   newText: "The house is blue",
  //   diff: {
  //     type: "insert",
  //     index: 4,
  //     text: "blue",
  //   },
  // },
];

test.each(testCases)("diffTexts(%o)", testCase => {
  const {diff, oldText, newText} = testCase;
  const result = diffTexts(oldText, newText);
  expect(result).toEqual(diff);
});
