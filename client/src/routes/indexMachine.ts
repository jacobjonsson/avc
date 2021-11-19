import {createMachine, assign} from "xstate";
import {Conversation} from "../domain/conversation";

interface IndexContext {
  conversations: Conversation[];
  stars: Record<string, boolean>;
  error?: Error;
  starId?: string;
}

export const indexMachine = createMachine<IndexContext>({
  id: "index",
  initial: "pendingFetchConversations",
  context: {
    conversations: [],
    stars: {},
    error: undefined,
    starId: undefined,
  },
  states: {
    pendingFetchConversations: {
      invoke: {
        src: () =>
          fetch(`${import.meta.env.VITE_API_URL}/conversations`)
            .then(res => res.json())
            .then(data => data.conversations),

        onDone: {
          target: "pendingFetchStars",
          actions: assign({conversations: (_, event) => event.data}),
        },

        onError: {
          target: "rejectedFetchConversations",
          actions: assign({error: (_, event) => event.data}),
        },
      },
    },

    rejectedFetchConversations: {},

    pendingFetchStars: {
      invoke: {
        src: () =>
          fetch(`${import.meta.env.VITE_API_URL}/stars`, {
            credentials: "include",
          })
            .then(res => res.json())
            .then(data => data.stars),

        onDone: {
          target: "idle",
          actions: assign({stars: (_, event) => event.data}),
        },

        onError: {
          target: "rejectedFetchStars",
          actions: assign({error: (_, event) => event.data}),
        },
      },
    },

    rejectedFetchStars: {},

    idle: {
      on: {
        star: {
          target: "pendingStar",
        },

        unStar: {
          target: "pendingUnStar",
        },

        delete: {
          target: "pendingDelete",
        },

        create: {
          target: "pendingCreate",
        },
      },
    },

    pendingStar: {
      invoke: {
        src: (ctx, event) =>
          fetch(`${import.meta.env.VITE_API_URL}/stars`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
              conversationId: event.id,
              stared: true,
            }),
          }),
        onDone: "pendingFetchStars",
      },
    },

    pendingUnStar: {
      invoke: {
        src: (ctx, event) =>
          fetch(`${import.meta.env.VITE_API_URL}/stars`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
              conversationId: event.id,
              stared: false,
            }),
          }),
        onDone: "pendingFetchStars",
      },
    },

    pendingDelete: {
      invoke: {
        src: (ctx, event) =>
          fetch(`${import.meta.env.VITE_API_URL}/conversations/${event.id}`, {
            method: "DELETE",
          }),

        onDone: "pendingFetchConversations",
      },
    },

    pendingCreate: {
      invoke: {
        src: (_, __) =>
          fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              id: new Date().getTime().toString(),
            }),
          }).then(res => res.json()),

        onDone: {
          actions: "redirect",
        },
      },
    },
  },
});
