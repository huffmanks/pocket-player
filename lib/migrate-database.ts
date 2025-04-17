import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import migrations from "@/db/migrations/migrations";
import { useDatabaseStore } from "@/lib/store";

export async function migrateDatabase() {
  const db = useDatabaseStore.getState().db;

  try {
    await migrate(db, migrations);

    return {
      message: "Database migration completed",
      isError: false,
    };
  } catch (err) {
    console.error(err);
    return {
      message: "Database migration failed.",
      isError: true,
    };
  }
}
