import {useEffect, useState} from "react";
import {Button} from "../components/button";
import {ChevronRightIcon} from "@heroicons/react/outline";
import {Conversation} from "../domain/conversation";

export function IndexRoute() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/conversations`)
      .then(res => res.json())
      .then(setConversations)
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl">Conversations</h1>

          <Button as="a" href="/conversations/new">
            Create conversation
          </Button>
        </div>

        <ul role="list" className="mt-6 space-y-3">
          {conversations.map(conversation => (
            <li key={conversation.id}>
              <a
                href={`/conversations/${conversation.id}`}
                className="block bg-white shadow overflow-hidden px-4 py-4 sm:px-6 sm:rounded-md"
              >
                <div className="flex items-center justify-between">
                  <span>
                    {conversation.text.length > 20
                      ? conversation.text.slice(0, 20) + "..."
                      : conversation.text}
                  </span>

                  <ChevronRightIcon className="w-6 h-6" />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
