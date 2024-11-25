import { openDatabaseSync } from "expo-sqlite";

import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "@/db/schema";

const expoDb = openDatabaseSync("database.db", { enableChangeListener: true });
export const db = drizzle(expoDb, { schema });

db.run("PRAGMA foreign_keys = ON");
