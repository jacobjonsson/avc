import fastify from "fastify";
import fastifyPostgres from "fastify-postgres";
import fastifyCors from "fastify-cors";
import fastifyCookie from "fastify-cookie";
import {nanoid} from "nanoid";
import {
  listMutations,
  listMutationsForConversation,
  storeMutation,
  deleteMutationsWithConversationId,
} from "./store/mutation";
import {listStars, upsertStar} from "./store/star";
import {Mutation, MutationOrigin} from "./domain/mutation";
import {Conversation} from "./domain/conversation";
import {formatZodErrors} from "./zod";
import {createMutationSchema} from "./schemas";
import {calculateText} from "./text";
import {z} from "zod";
import {
  deleteConversation,
  listConversations,
  storeConversation,
} from "./store/conversation";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/avc";

const server = fastify({logger: true});

server.register(fastifyPostgres, {connectionString: DATABASE_URL});
server.register(fastifyCookie);
server.register(fastifyCors, {
  methods: ["GET", "POST", "DELETE", "OPTION"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Set-Cookie"],
  origin:
    process.env.ENV === "production"
      ? [
          "https://web.ava.me",
          "https://stage.account.ava.me",
          "https://avc-client.onrender.com",
        ]
      : "http://localhost:3000",
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
  const conversationIds = await listConversations(server.pg);
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

  const emptyConversations = conversationIds.filter(
    convo => !conversations.some(c => c.id === convo)
  );

  for (const emptyConversation of emptyConversations) {
    conversations.push({
      id: emptyConversation,
      mutations: [],
      text: "",
    });
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

const postConversationsScheme = z.object({
  id: z.string(),
});

// POST /conversations
server.post("/conversations", async (request, reply) => {
  const body = postConversationsScheme.safeParse(request.body);
  if (!body.success) {
    reply.status(400).send({ok: false, msg: formatZodErrors(body.error)});
    return;
  }

  await storeConversation(server.pg, body.data.id);

  reply.status(201).send({ok: true, id: body.data.id});
});

const getConversationParamsSchema = z.object({
  conversationId: z.string(),
});

server.get("/conversations/:conversationId", async (request, reply) => {
  const params = getConversationParamsSchema.safeParse(request.params);
  if (!params.success) {
    reply.status(400).send({ok: false, msg: formatZodErrors(params.error)});
    return;
  }

  const mutations = await listMutationsForConversation(
    server.pg,
    params.data.conversationId,
    "DESC"
  );

  let conversation: Partial<Conversation> = {};
  conversation.id = params.data.conversationId;
  if (mutations.length > 0) {
    conversation.lastMutation = mutations[0];
    conversation.lastMutation.origin = calculateMutationOrigin(mutations);
    conversation.text = calculateText(mutations.reverse());
  } else {
    conversation.text = "";
  }

  reply.status(200).send({ok: true, conversation: conversation});
});

const deleteConversationParamsSChema = z.object({
  conversationId: z.string(),
});

server.delete("/conversations/:conversationId", async (request, reply) => {
  const params = deleteConversationParamsSChema.safeParse(request.params);
  if (!params.success) {
    reply.status(400).send({ok: false, msg: formatZodErrors(params.error)});
    return;
  }

  await deleteConversation(server.pg, params.data.conversationId);

  reply.status(200).send({ok: true, msg: "conversation deleted"});
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

server.get("/stars", async (request, reply) => {
  const userId = request.cookies.userId;

  if (!userId) {
    reply
      .status(200)
      .setCookie("userId", nanoid(), {
        httpOnly: true,
        path: "/",
        domain: undefined,
      })
      .send({ok: true, stars: {}});
  }

  const stars = await listStars(server.pg, userId);
  reply.status(200).send({ok: true, stars});
});

const postStarsSchema = z.object({
  conversationId: z.string(),
  stared: z.boolean(),
});

server.post("/stars", async (request, reply) => {
  const body = postStarsSchema.safeParse(request.body);
  if (!body.success) {
    reply.status(400).send({ok: false, msg: formatZodErrors(body.error)});
    return;
  }

  console.log(request.cookies);
  let userId = request.cookies.userId;
  console.log(userId);
  if (!userId) {
    userId = nanoid();
  }

  await upsertStar(
    server.pg,
    userId,
    body.data.conversationId,
    body.data.stared
  );

  reply
    .status(201)
    .setCookie("userId", userId, {
      httpOnly: true,
      path: "/",
      domain: undefined,
    })
    .send({ok: true, msg: "ok"});
});
