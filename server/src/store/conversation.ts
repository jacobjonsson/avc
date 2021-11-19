import {PGClient} from "./shared";

export function storeConversation(client: PGClient, conversationId: string) {
  const query = `
    INSERT INTO conversations (id)
    VALUES ($1)
    ON CONFLICT DO NOTHING;
  `;
  return client.query(query, [conversationId]);
}

export async function deleteConversation(
  client: PGClient,
  conversationId: string
) {
  const query = `
    DELETE FROM conversations
    WHERE id = $1
  `;
  await client.query(query, [conversationId]);
}

export function listConversations(client: PGClient): Promise<string[]> {
  const query = `SELECT id FROM conversations`;

  return client
    .query<{id: string}>(query)
    .then(({rows}) => rows.map(row => row.id));
}
