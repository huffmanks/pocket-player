import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

import { initialize } from "./drizzle";

type ContextType = { db: SQLJsDatabase | ExpoSQLiteDatabase | null };

export const DatabaseContext = createContext<ContextType>({ db: null });

export const useDatabase = () => useContext(DatabaseContext);

export function DatabaseProvider({ children }: PropsWithChildren) {
  const [db, setDb] = useState<SQLJsDatabase | ExpoSQLiteDatabase | null>(null);

  useEffect(() => {
    if (db) return;
    initialize().then((newDb) => {
      setDb(newDb);
    });
  }, []);

  return <DatabaseContext.Provider value={{ db }}>{children}</DatabaseContext.Provider>;
}
