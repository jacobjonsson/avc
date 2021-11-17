/* eslint-disable @typescript-eslint/naming-convention */
import {MigrationBuilder, ColumnDefinitions} from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("mutations", {
    id: {type: "text", primaryKey: true, notNull: true},
    conversation_id: {type: "text", notNull: true},
    author: {type: "text", notNull: true},
    type: {type: "text", notNull: true},
    text: {type: "text", notNull: true},
    length: {type: "int", notNull: true},
    index: {type: "int", notNull: true},
    created_at: {type: "timestamp", notNull: true},
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("mutations");
}
