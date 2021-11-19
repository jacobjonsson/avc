import {useEffect, useRef} from "react";
import {useParams} from "react-router";
import {Button} from "../components/button";
import {diffTexts} from "../utils/text";
import {useMachine} from "@xstate/react";
import {conversationMachine} from "./conversationMachine";
import {Breadcrumbs} from "../components/breadcrumbs";
import {LoadingIndicator} from "../components/loadingIndicator";

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
    <div className="container mx-auto px-4 md:px-0 pt-4 space-y-8">
      <LoadingIndicator />

      <Breadcrumbs
        items={[
          {name: "Conversations", href: "/", current: false},
          {
            name: conversationId!,
            href: `/conversations/${conversationId}`,
            current: true,
          },
        ]}
      />

      {state.matches("editing") ? (
        <>
          <form
            onSubmit={evt => {
              evt.preventDefault();

              const textDiff = diffTexts(
                state.context.conversation!.text,
                textAreaRef.current!.value
              );

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
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-4"
              placeholder="Edit the text..."
              disabled={!state.matches("editing")}
              defaultValue={state.context.conversation!.text}
            />

            <Button as="button" type="submit" className="mr-4">
              Save
            </Button>

            <Button
              as="button"
              type="button"
              variant="secondary"
              onClick={() => send("discard")}
            >
              Discard
            </Button>
          </form>
        </>
      ) : null}

      {state.matches("idle") ? (
        <div>
          <div className="mb-4">
            <textarea
              disabled
              rows={5}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md opacity-90"
            >
              {state.context.conversation!.text}
            </textarea>
          </div>

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
      ) : null}
    </div>
  );
}
