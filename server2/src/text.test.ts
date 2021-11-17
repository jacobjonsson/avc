import {Mutation} from "./domain/mutation";
import {calculateText} from "./text";

interface TestCase {
  mutations: Mutation[];
  text: string;
}

type MutationMock =
  | {
      type: "insert";
      text: string;
      index: number;
    }
  | {
      type: "delete";
      length: number;
      index: number;
    };

function createMutationMock(mock: MutationMock): Mutation {
  return {
    id: "id",
    type: mock.type,
    index: mock.index,
    length: mock.type === "delete" ? mock.length : 0,
    text: mock.type === "insert" ? mock.text : "",
    author: "alice",
    origin: {alice: 0, bob: 0},
    conversationId: "conversationId",
    createdAt: new Date().toISOString(),
  };
}

const testCases: TestCase[] = [
  {
    mutations: [
      createMutationMock({text: "hello", type: "insert", index: 0}),
      createMutationMock({text: " world", type: "insert", index: 5}),
    ],
    text: "hello world",
  },
  {
    mutations: [
      createMutationMock({text: "The", type: "insert", index: 0}),
      createMutationMock({text: " house", type: "insert", index: 3}),
      createMutationMock({text: " is", type: "insert", index: 9}),
    ],
    text: "The house is",
  },
  {
    mutations: [
      createMutationMock({type: "insert", text: "123456789", index: 0}),
      createMutationMock({type: "delete", length: 3, index: 3}),
    ],
    text: "123789",
  },
  {
    mutations: [
      createMutationMock({type: "insert", text: "The", index: 0}),
      createMutationMock({type: "insert", text: " house", index: 3}),
      createMutationMock({type: "insert", text: " is", index: 9}),
      createMutationMock({type: "insert", text: " red.", index: 12}),
      createMutationMock({type: "delete", length: 5, index: 4}),
    ],
    text: "The  is red.",
  },
];

test.each(testCases)("calculateText(%p)", testCase => {
  expect(calculateText(testCase.mutations)).toBe(testCase.text);
});
