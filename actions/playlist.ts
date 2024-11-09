import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { playlistVideos, playlists } from "@/db/schema";

export async function addToPlaylist({
  playlistId,
  videoId,
}: {
  playlistId: string;
  videoId: string;
}) {
  try {
    await db.insert(playlistVideos).values({ playlistId, videoId });

    return {
      message: "Video has been added to playlist.",
      type: "success",
    };
  } catch (error) {
    console.error("Error adding video to playlist: ", error);
    return { message: "Error adding video to playlist.", type: "error" };
  }
}

export async function removeFromPlaylist({ videoId }: { videoId: string }) {
  try {
    await db.delete(playlistVideos).where(eq(playlistVideos.videoId, videoId));

    return {
      message: "Video has been removed from playlist.",
      type: "success",
    };
  } catch (error) {
    console.error("Error removing video from playlist: ", error);
    return { message: "Error removing video from playlist.", type: "error" };
  }
}

export async function deletePlaylist(playlistId: string) {
  try {
    const [playlist] = await db.delete(playlists).where(eq(playlists.id, playlistId)).returning();
    return { message: `${playlist.title} has been deleted.`, type: "success" };
  } catch (error) {
    console.error("Error deleting playlist: ", error);
    return { message: "Error deleting playlist.", type: "error" };
  }
}
