import {PGClient} from "./shared";

export function storeConversation(client: PGClient, conversationId: string) {
  const query = `
    INSERT INTO conversations (id, deleted)
    VALUES ($1, false)
    ON CONFLICT DO NOTHING;
  `;
  return client.query(query, [conversationId]);
}

export async function deleteConversation(
  client: PGClient,
  conversationId: string
) {
  const query = `
    UPDATE conversations
    SET deleted = true
    WHERE id = $1;
  `;
  await client.query(query, [conversationId]);
}

export function listConversations(client: PGClient): Promise<string[]> {
  const query = `SELECT id FROM conversations WHERE deleted = false`;

  return client
    .query<{id: string}>(query)
    .then(({rows}) => rows.map(row => row.id));
}
