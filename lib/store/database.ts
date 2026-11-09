import { create } from "zustand";

import { db as drizzleDb } from "@/db/drizzle";

type DatabaseStore = {
  db: typeof drizzleDb;
};

export const useDatabaseStore = create<DatabaseStore>(() => ({
  db: drizzleDb,
}));
