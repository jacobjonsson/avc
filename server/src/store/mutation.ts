import {Mutation, MutationDB, MutationOrigin} from "../domain/mutation";
import type {PGClient} from "./shared";

function rowToMutation(row: MutationDB): Mutation {
  return {
    id: row.id,
    type: row.type,
    index: row.index,
    length: row.length,
    text: row.text,
    author: row.author,
    origin: {alice: 0, bob: 0},
    conversationId: row.conversation_id,
    createdAt: row.created_at,
  };
}

export async function listMutations(pool: PGClient): Promise<Mutation[]> {
  const query = `
    SELECT * FROM mutations
    WHERE conversation_id IN (SELECT id FROM conversations WHERE deleted = false)
    ORDER BY created_at DESC
  `;
  const {rows} = await pool.query<MutationDB>(query);
  return rows.map(rowToMutation);
}

export async function listMutationsForConversation(
  pool: PGClient,
  conversationId: string,
  sort: "ASC" | "DESC" = "DESC"
): Promise<Mutation[]> {
  const query = `
    SELECT * FROM mutations
    WHERE conversation_id = $1
    ORDER BY created_at ${sort}
  `;
  const {rows} = await pool.query<MutationDB>(query, [conversationId]);
  return rows.map(rowToMutation);
}

export async function storeMutation(
  pool: PGClient,
  mutation: Mutation
): Promise<void> {
  await pool.query(
    `
  INSERT INTO conversations (id)
  VALUES ($1)
  ON CONFLICT DO NOTHING`,
    [mutation.conversationId]
  );

  const query = `
    INSERT INTO mutations (id, type, index, length, text, author, created_at, conversation_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  await pool.query(query, [
    mutation.id,
    mutation.type,
    mutation.index,
    mutation.length,
    mutation.text,
    mutation.author,
    mutation.createdAt,
    mutation.conversationId,
  ]);
}

export async function deleteMutationsWithConversationId(
  pool: PGClient,
  conversationId: string
): Promise<void> {
  const query = `
    DELETE FROM mutations
    WHERE conversation_id = $1
  `;
  await pool.query(query, [conversationId]);
}
