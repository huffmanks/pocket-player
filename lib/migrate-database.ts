import { migrate } from "drizzle-orm/expo-sqlite/migrator";

import migrations from "@/db/migrations/migrations";
import { errorHandler } from "@/lib/error-handler";
import { useDatabaseStore } from "@/lib/store";

export async function migrateDatabase() {
  const db = useDatabaseStore.getState().db;

  try {
    await migrate(db, migrations);

    return {
      message: "Database migration completed",
      isError: false,
    };
  } catch (error) {
    const message = errorHandler(error);
    return {
      message,
      isError: true,
    };
  }
}
