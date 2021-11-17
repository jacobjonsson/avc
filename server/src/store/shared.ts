import {QueryResult} from "pg";

// An abstraction over the postgres client to make it easy
// to pass around the database connection and query functions
export interface PGClient {
  query<T>(sql: string): Promise<QueryResult<T>>;
  query<T>(sql: string, args: any[]): Promise<QueryResult<T>>;
}
