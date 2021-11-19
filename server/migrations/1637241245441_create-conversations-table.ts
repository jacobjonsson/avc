/* eslint-disable @typescript-eslint/naming-convention */
import {MigrationBuilder, ColumnDefinitions} from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("conversations", {
    id: {type: "text", primaryKey: true, notNull: true},
  });

  pgm.addConstraint("mutations", "conversation_id_fkey", {
    foreignKeys: {
      columns: "conversation_id",
      references: "conversations(id)",
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("conversations");

  pgm.dropConstraint("mutations", "conversation_id", {ifExists: true});
}
