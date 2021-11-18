export type MutationType = "insert" | "delete";

export type Author = "alice" | "bob";

export interface MutationOrigin {
  alice: number;
  bob: number;
}

export interface Mutation {
  id: string;
  type: MutationType;
  index: number;
  length: number;
  text: string;
  author: Author;
  origin: MutationOrigin;
  conversationId: string;
  createdAt: string;
}

export type CreateMutation = {
  author: Author;
  origin: MutationOrigin;
  conversationId: string;
  data:
    | {
        type: "insert";
        index: number;
        text: string;
      }
    | {
        type: "delete";
        index: number;
        length: number;
      };
};
