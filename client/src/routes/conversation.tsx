import {useEffect, useReducer, useRef, useState} from "react";
import {useParams} from "react-router";
import {Conversation} from "../domain/conversation";
import {CreateMutation} from "../domain/mutation";
import {Effect, createEffect} from "../utils/effect";
import {Button} from "../components/button";
import {diffTexts} from "../utils/text";

type ConversationState = (
  | {status: "param.pending"}
  | {status: "fetch.pending"}
  | {status: "fetch.rejected"; error: Error}
  | {status: "idle"; conversation: Conversation}
  | {status: "editing"; conversation: Conversation; author: "alice" | "bob"}
  | {status: "save.pending"; conversation: Conversation}
  | {status: "save.rejected"; conversation: Conversation; error: Error}
) & {
  effects: ConversationEffect[];
};

type ConversationEvent =
  | {type: "fetch"; conversationId: string}
  | {type: "fetch.resolve"; conversation: Conversation}
  | {type: "fetch.reject"; error: Error}
  | {type: "edit"; author: "alice" | "bob"}
  | {type: "edit.save"; mutation: CreateMutation}
  | {type: "edit.discard"}
  | {type: "save.resolve"}
  | {type: "save.reject"; error: Error};

type ConversationEffect =
  | Effect<"fetch", {conversationId: string}>
  | Effect<"save", {mutation: CreateMutation}>;

function reducer(
  state: ConversationState,
  event: ConversationEvent
): ConversationState {
  switch (state.status) {
    case "param.pending": {
      if (event.type === "fetch") {
        return {
          ...state,
          status: "fetch.pending",
          effects: [
            ...state.effects,
            createEffect("fetch", {conversationId: event.conversationId}),
          ],
        };
      }

      return state;
    }

    case "fetch.pending": {
      if (event.type === "fetch.resolve") {
        return {...state, status: "idle", conversation: event.conversation};
      }

      if (event.type === "fetch.reject") {
        return {...state, status: "fetch.rejected", error: event.error};
      }

      return state;
    }

    case "fetch.rejected": {
      if (event.type === "fetch") {
        return {
          ...state,
          status: "fetch.pending",
          effects: [
            ...state.effects,
            createEffect("fetch", {conversationId: event.conversationId}),
          ],
        };
      }

      return state;
    }

    case "save.rejected":
    case "idle": {
      if (event.type === "edit") {
        return {...state, status: "editing", author: event.author};
      }

      return state;
    }

    case "editing": {
      if (event.type === "edit.save") {
        return {
          ...state,
          status: "save.pending",
          effects: [
            ...state.effects,
            createEffect("save", {mutation: event.mutation}),
          ],
        };
      }

      if (event.type === "edit.discard") {
        return {...state, status: "idle"};
      }
    }

    case "save.pending": {
      if (event.type === "save.resolve") {
        return {
          ...state,
          status: "fetch.pending",
          effects: [
            ...state.effects,
            createEffect("fetch", {conversationId: state.conversation.id}),
          ],
        };
      }

      if (event.type === "save.reject") {
        return state;
      }
    }

    default:
      return state;
  }
}

export function ConversationRoute() {
  const {conversationId} = useParams();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [{effects, ...state}, dispatch] = useReducer(reducer, {
    status: "param.pending",
    effects: [],
  });

  useEffect(() => {
    if (typeof conversationId === "string") {
      dispatch({type: "fetch", conversationId});
    }
  }, [conversationId]);

  useEffect(() => {
    for (const effect of effects) {
      if (effect.executed) continue;
      effect.markAsExecuted();

      if (effect.type === "fetch") {
        fetch(
          `${import.meta.env.VITE_API_URL}/conversations/${
            effect.data.conversationId
          }`
        )
          .then(res => res.json())
          .then(({conversation}) =>
            dispatch({type: "fetch.resolve", conversation})
          )
          .catch(error => dispatch({type: "fetch.reject", error}));
      }

      if (effect.type === "save") {
        fetch(`${import.meta.env.VITE_API_URL}/mutations`, {
          method: "POST",
          body: JSON.stringify(effect.data.mutation),
          headers: {"Content-Type": "application/json"},
        })
          .then(() => dispatch({type: "save.resolve"}))
          .catch(error => dispatch({type: "save.reject", error}));
      }
    }
  }, [effects]);

  return (
    <div className="container mx-auto px-4 md:px-0 pt-4">
      <h1 className="text-xl mb-4">Conversation: {conversationId}</h1>

      {state.status === "editing" ? (
        <>
          <form
            onSubmit={evt => {
              evt.preventDefault();

              const textDiff = diffTexts(
                state.conversation.text,
                textAreaRef.current!.value
              );
              if (textDiff.type === "identical") {
                dispatch({type: "edit.discard"});
                return;
              }

              dispatch({
                type: "edit.save",
                mutation: {
                  data: textDiff,
                  conversationId: state.conversation.id,
                  author: state.author,
                  origin: state.conversation.lastMutation?.origin || {
                    alice: 0,
                    bob: 0,
                  },
                },
              });
            }}
          >
            <textarea
              rows={5}
              name="text"
              id="text"
              ref={textAreaRef}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Edit the text..."
              disabled={state.status !== "editing"}
              defaultValue={state.conversation.text}
            />

            <Button as="button" type="submit">
              Save
            </Button>
          </form>
        </>
      ) : null}

      {state.status === "idle" ? (
        <>
          <div className="border-b mb-4">
            <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
              {state.conversation.text}
            </div>
          </div>

          <div className="flex justify-start items-center">
            <Button
              className="mr-4"
              as="button"
              type="button"
              onClick={() => dispatch({type: "edit", author: "bob"})}
            >
              Edit as Bob
            </Button>
            <Button
              as="button"
              onClick={() => dispatch({type: "edit", author: "bob"})}
            >
              Edit as Alice
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
