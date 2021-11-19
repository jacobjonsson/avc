import {PGClient} from "./shared";

export async function listStars(
  client: PGClient,
  userId: string
): Promise<Record<string, boolean>> {
  const query = `
    SELECT stared, conversation_id FROM stars
    WHERE id = $1
  `;

  const {rows} = await client.query<{stared: boolean; conversation_id: string}>(
    query,
    [userId]
  );

  const stars: Record<string, boolean> = {};
  for (const row of rows) {
    stars[row.conversation_id] = row.stared;
  }

  return stars;
}

export async function upsertStar(
  client: PGClient,
  userId: string,
  conversationId: string,
  stared: boolean
): Promise<void> {
  const query = `
    INSERT INTO stars (id, conversation_id, stared)
    VALUES ($1, $2, $3)
    ON CONFLICT (id, conversation_id) DO UPDATE SET stared = $3
  `;

  await client.query(query, [userId, conversationId, stared]);
}
