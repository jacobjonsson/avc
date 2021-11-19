/* eslint-disable @typescript-eslint/naming-convention */
import {MigrationBuilder, ColumnDefinitions} from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("stars", {
    id: {type: "text", notNull: true},
    stared: {type: "boolean", notNull: true},
    conversation_id: {type: "text", notNull: true},
  });

  pgm.createConstraint("stars", "pk_stars", {
    primaryKey: ["id", "conversation_id"],
  });

  pgm.createConstraint("stars", "conversation_id_fkey", {
    foreignKeys: {
      columns: "conversation_id",
      references: "conversations(id)",
      onDelete: "CASCADE",
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("stars");
}
