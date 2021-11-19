import {
  ChevronRightIcon,
  StarIcon as StarIconOutline,
  TrashIcon,
} from "@heroicons/react/outline";
import {StarIcon as StarIconSolid} from "@heroicons/react/solid";
import {Link, useNavigate} from "react-router-dom";
import {indexMachine} from "./indexMachine";
import {Button} from "../components/button";
import {useMachine} from "@xstate/react";

export function IndexRoute() {
  const navigate = useNavigate();

  const [state, send] = useMachine(indexMachine, {
    actions: {
      redirect: (_, evt) => navigate(`/conversations/${evt.data.id}`),
    },
  });

  return (
    <div className="container mx-auto px-4 md:px-0 pt-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Conversations</h1>

        <Button as="button" onClick={() => send("create")}>
          Create new
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
                  {state.context.conversations.map((conversation, idx) => (
                    <tr
                      key={conversation.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                        {new Date(
                          parseInt(conversation.id, 10)
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conversation.text.length > 20
                          ? conversation.text.slice(0, 20) + "..."
                          : conversation.text}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            state.context.stars[conversation.id]
                              ? send("unStar", {id: conversation.id})
                              : send("star", {id: conversation.id})
                          }
                        >
                          {state.context.stars[conversation.id] ? (
                            <StarIconSolid className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <StarIconOutline className="w-6 h-6 text-yellow-600" />
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => send("delete", {id: conversation.id})}
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
