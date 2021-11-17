import fastify from "fastify";
import fastifyPostgres from "fastify-postgres";
import fastifyCors from "fastify-cors";
import {nanoid} from "nanoid";
import {
  listMutations,
  listMutationsForConversation,
  storeMutation,
} from "./store/mutation";
import {Mutation, MutationOrigin} from "./domain/mutation";
import {Conversation} from "./domain/conversation";
import {formatZodErrors} from "./zod";
import {createMutationSchema} from "./schemas";
import {calculateText} from "./text";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/avc";

const server = fastify({logger: true});

server.register(fastifyPostgres, {connectionString: DATABASE_URL});

server.register(fastifyCors, {
  methods: ["GET", "POST"],
  origin:
    process.env.ENV === "production"
      ? [
          "https://web.ava.me",
          "https://stage.account.ava.me",
          "https://avc-client.onrender.com",
        ]
      : "*",
});

server.setErrorHandler((error, _, reply) => {
  server.log.error(error);

  if (error.statusCode === 404) {
    reply.send({ok: false, msg: "Not found"});
  } else {
    reply.send({ok: false, msg: "Internal server error"});
  }
});

server.get("/", (_, reply) => {
  reply.send({ok: true, msg: "ok"});
});

// GET /ping
server.get("/ping", async (_, reply) => {
  reply
    .header("Content-Type", "application/json")
    .status(200)
    .send({ok: true, msg: "pong"});
});

// GET /info
server.get("/info", async (_, reply) => {
  reply
    .header("Content-Type", "application/json")
    .status(200)
    .send({
      ok: true,
      author: {email: "jacobjjonsson@gmail.com", name: "Jacob Jonsson"},
      frontend: {url: "https://jacobjonsson.github.io/avc"},
      language: "node.js",
      source: "https://www.github.com/jacobjonsson/avc",
    });
});

function calculateMutationOrigin(mutations: Mutation[]): MutationOrigin {
  const origin: MutationOrigin = {alice: 0, bob: 0};

  for (const mutation of mutations.slice(0, -1)) {
    if (mutation.author === "alice") {
      origin.alice++;
    } else if (mutation.author === "bob") {
      origin.bob++;
    }
  }

  return origin;
}

// GET /conversations
server.get("/conversations", async (request, reply) => {
  const mutations = await listMutations(server.pg);

  const conversations: Conversation[] = [];

  for (const mutation of mutations) {
    const conversation = conversations.find(
      c => c.id === mutation.conversationId
    );

    if (conversation) {
      conversation.mutations.push(mutation);
    } else {
      conversations.push({
        id: mutation.conversationId,
        mutations: [mutation],
        text: mutation.text,
      });
    }
  }

  for (const conversation of conversations) {
    conversation.lastMutation = conversation.mutations[0];
    conversation.text = calculateText(conversation.mutations.reverse());
    conversation.lastMutation.origin = calculateMutationOrigin(
      conversation.mutations
    );
  }

  reply.status(200).send({
    ok: true,
    conversations: conversations.map(conversation => ({
      id: conversation.id,
      text: conversation.text,
      lastMutation: conversation.lastMutation,
    })),
  });
});

server.post("/mutations", async (request, reply) => {
  const body = createMutationSchema.safeParse(request.body);
  if (!body.success) {
    reply.status(400).send({ok: false, msg: formatZodErrors(body.error)});
    return;
  }

  const mutation: Mutation = {
    id: nanoid(),
    conversationId: body.data.conversationId,
    author: body.data.author,
    index: body.data.data.index,
    length: body.data.data.type === "delete" ? body.data.data.length : 0,
    origin: body.data.origin,
    text: body.data.data.type === "insert" ? body.data.data.text : "",
    type: body.data.data.type,
    createdAt: new Date().toISOString(),
  };

  await storeMutation(server.pg, mutation);
  const mutations = await listMutationsForConversation(
    server.pg,
    mutation.conversationId,
    "ASC"
  );

  const text = calculateText(mutations);

  reply.status(201).send({ok: true, text});
});

server.listen(process.env.PORT || "3001", error => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  }
});
