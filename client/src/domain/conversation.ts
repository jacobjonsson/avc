import {Mutation} from "./mutation";

export interface Conversation {
  id: string;
  createdAt: string;
  text: string;
  lastMutation?: Mutation;
}
