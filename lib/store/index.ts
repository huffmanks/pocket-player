import { useAppStore } from "@/lib/store/app";
import { useDatabaseStore } from "@/lib/store/database";
import { usePlaylistStore } from "@/lib/store/playlist";
import { securityStorage, useSecurityStore } from "@/lib/store/security";
import { settingsStorage, useSettingsStore } from "@/lib/store/settings";
import { useVideoStore } from "@/lib/store/video";

export {
  useAppStore,
  useDatabaseStore,
  usePlaylistStore,
  useSecurityStore,
  useSettingsStore,
  useVideoStore,
};

export function resetPersistedStorage() {
  useSettingsStore.persist.clearStorage();
  useSecurityStore.persist.clearStorage();

  useSettingsStore.getState().reset();
  useSecurityStore.getState().reset();

  settingsStorage.clearAll();
  securityStorage.clearAll();
}
