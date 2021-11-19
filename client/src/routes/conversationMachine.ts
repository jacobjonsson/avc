import {createMachine, assign} from "xstate";
import {Conversation} from "../domain/conversation";
import {CreateMutation} from "../domain/mutation";

interface ConversationContext {
  createMutation?: CreateMutation;
  conversation?: Conversation;
  id?: string;
  error?: Error;
  author?: "alice" | "bob";
}

export const conversationMachine = createMachine<ConversationContext>({
  id: "conversation",
  initial: "pendingParam",
  context: {
    conversation: undefined,
    id: undefined,
    error: undefined,
  },

  states: {
    pendingParam: {
      on: {
        resolve: {
          target: "pendingFetch",
          actions: assign({id: (_, event) => event.id}),
        },
      },
    },

    pendingFetch: {
      invoke: {
        src: context =>
          fetch(`${import.meta.env.VITE_API_URL}/conversations/${context.id}`)
            .then(res => res.json())
            .then(data => data.conversation),
        onDone: {
          target: "idle",
          actions: assign({conversation: (_, event) => event.data}),
        },
        onError: {
          target: "rejectedFetch",
          actions: assign({error: (_, event) => event.data}),
        },
      },
    },

    idle: {
      on: {
        edit: {
          target: "editing",
          actions: assign({author: (_, event) => event.author}),
        },
      },
    },

    rejectedFetch: {},

    editing: {
      on: {
        save: {
          target: "pendingSave",
          actions: assign({createMutation: (_, event) => event.createMutation}),
        },

        discard: {
          target: "idle",
        },
      },
    },

    pendingSave: {
      invoke: {
        src: context =>
          fetch(`${import.meta.env.VITE_API_URL}/mutations`, {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify(context.createMutation),
          }),

        onDone: {
          target: "pendingFetch",
          actions: assign({createMutation: (_, __) => undefined}),
        },

        onError: {
          target: "editing",
          actions: assign({error: (_, event) => event.data}),
        },
      },
    },
  },
});
