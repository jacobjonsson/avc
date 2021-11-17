import {Mutation} from "./mutation";

export interface Conversation {
  // The timestamp when the conversation was created
  id: string;
  // All of the mutations in the conversation
  mutations: Mutation[];
  // The most recent mutation in the conversation
  lastMutation?: Mutation;
  // The most recent mutation in the conversation
  text: string;
}
