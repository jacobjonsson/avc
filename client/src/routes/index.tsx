import {useEffect, useState} from "react";
import {Button} from "../components/button";
import {
  ChevronRightIcon,
  StarIcon as StarIconOutline,
  TrashIcon,
} from "@heroicons/react/outline";
import {StarIcon as StarIconSolid} from "@heroicons/react/solid";
import {Conversation} from "../domain/conversation";
import {Link} from "react-router-dom";

export function IndexRoute() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stars, setStars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/conversations`)
      .then(res => res.json())
      .then(data => setConversations(data.conversations))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL}/stars`, {credentials: "include"})
      .then(res => res.json())
      .then(data => setStars(data.stars))
      .catch(err => console.error(err));
  }, []);

  function star(id: string) {
    fetch(`${import.meta.env.VITE_API_URL}/stars`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({
        stared: true,
        conversationId: id,
      }),
    })
      .then(() => {
        setStars({...stars, [id]: true});
      })
      .catch(err => console.error(err));
  }

  function unstar(id: string) {
    fetch(`${import.meta.env.VITE_API_URL}/stars`, {
      method: "POST",
      credentials: "include",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        stared: false,
        conversationId: id,
      }),
    })
      .then(() => {
        setStars({...stars, [id]: false});
      })
      .catch(err => console.error(err));
  }

  function deleteConversation(id: string) {
    fetch(`${import.meta.env.VITE_API_URL}/conversations/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setConversations(conversations.filter(c => c.id !== id));
      })
      .catch(err => console.error(err));
  }

  return (
    <div className="container mx-auto px-4 md:px-0 pt-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Conversations</h1>

        <Button as="a" href="/conversations/new">
          Create conversation
        </Button>
      </div>

      <div className="flex flex-col mt-8">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created at
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Text
                    </th>

                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Star</span>
                    </th>

                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Delete</span>
                    </th>

                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {conversations.map((conversation, idx) => (
                    <tr
                      key={conversation.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(
                          parseInt(conversation.id, 10)
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {conversation.text.length > 20
                          ? conversation.text.slice(0, 20) + "..."
                          : conversation.text}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            stars[conversation.id]
                              ? unstar(conversation.id)
                              : star(conversation.id)
                          }
                        >
                          {stars[conversation.id] ? (
                            <StarIconSolid className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <StarIconOutline className="w-6 h-6 text-yellow-600" />
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => deleteConversation(conversation.id)}
                        >
                          <TrashIcon className="w-6 h-6 text-red-600" />
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end">
                        <Link to={`/conversations/${conversation.id}`}>
                          <ChevronRightIcon className="w-6 h-6 text-blue-600" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
