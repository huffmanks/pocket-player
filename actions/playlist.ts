import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { playlists } from "@/db/schema";

export async function deletePlaylist(playlistId: string) {
  try {
    const [playlist] = await db.delete(playlists).where(eq(playlists.id, playlistId)).returning();
    return { message: `${playlist.title} has been deleted.`, type: "success" };
  } catch (error) {
    console.error("Error deleting video: ", error);
    return { message: "Error deleting video.", type: "error" };
  }
}
