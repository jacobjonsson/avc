import {Mutation} from "./mutation";

export interface Conversation {
  id: string;
  text: string;
  lastMutation?: Mutation;
}
