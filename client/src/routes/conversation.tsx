import {useEffect, useRef} from "react";
import {useParams} from "react-router";
import {Button} from "../components/button";
import {diffTexts} from "../utils/text";
import {useMachine} from "@xstate/react";
import {conversationMachine} from "./conversationMachine";

export function ConversationRoute() {
  const {conversationId} = useParams();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [state, send] = useMachine(conversationMachine);

  useEffect(() => {
    if (typeof conversationId === "string") {
      send("resolve", {id: conversationId});
    }
  }, [conversationId]);

  return (
    <div className="container mx-auto px-4 md:px-0 pt-4">
      <h1 className="text-xl mb-4">Conversation: {conversationId}</h1>

      {state.matches("editing") ? (
        <>
          <form
            onSubmit={evt => {
              evt.preventDefault();

              const textDiff = diffTexts(
                state.context.conversation!.text,
                textAreaRef.current!.value
              );

              console.log(state.context.conversation!.text);
              console.log(textAreaRef.current!.value);
              console.log(textDiff);

              if (textDiff.type === "identical") {
                send("discard");
                return;
              }

              send("save", {
                createMutation: {
                  data: textDiff,
                  conversationId: state.context.conversation!.id,
                  author: state.context.author,
                  origin: state.context.conversation!.lastMutation?.origin || {
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
              disabled={!state.matches("editing")}
              defaultValue={state.context.conversation!.text}
            />

            <Button as="button" type="submit">
              Save
            </Button>
          </form>
        </>
      ) : null}

      {state.matches("idle") ? (
        <>
          <div className="border-b mb-4">
            <div className="mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5 text-gray-800">
              {state.context.conversation!.text}
            </div>
          </div>

          <div className="flex justify-start items-center">
            <Button
              className="mr-4"
              as="button"
              type="button"
              onClick={() => send("edit", {author: "bob"})}
            >
              Edit as Bob
            </Button>

            <Button as="button" onClick={() => send("edit", {author: "bob"})}>
              Edit as Alice
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
