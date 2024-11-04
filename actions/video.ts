import * as FileSystem from "expo-file-system";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { videos } from "@/db/schema";

export async function favoriteVideo(videoId: string) {
  try {
    const [video] = await db
      .select({ id: videos.id, title: videos.title, isFavorite: videos.isFavorite })
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video) return { message: "Error adding video to favorites.", type: "error" };
    await db.update(videos).set({ isFavorite: !video.isFavorite }).where(eq(videos.id, video.id));

    const variantText = !video.isFavorite ? "added to" : "removed from";

    return {
      message: `${video.title} has been ${variantText} favorites.`,
      type: "success",
      added: !video.isFavorite,
    };
  } catch (error) {
    console.error("Error adding video to favorites: ", error);
    return { message: "Error adding video to favorites.", type: "error" };
  }
}

export async function deleteVideo(videoId: string) {
  try {
    const [video] = await db
      .select({ title: videos.title, videoUri: videos.videoUri, thumbUri: videos.thumbUri })
      .from(videos)
      .where(eq(videos.id, videoId));

    if (!video || !video.videoUri) return { message: "Error deleting video.", type: "error" };

    // Delete video file
    const videoInfo = await FileSystem.getInfoAsync(video.videoUri);
    if (videoInfo.exists) await FileSystem.deleteAsync(video.videoUri);

    // Delete thumbnail file
    const thumbInfo = await FileSystem.getInfoAsync(video.thumbUri);
    if (thumbInfo.exists) await FileSystem.deleteAsync(video.thumbUri);

    // Delete database entry
    await db.delete(videos).where(eq(videos.id, videoId));
    return { message: `${video.title} has been deleted.`, type: "success" };
  } catch (error) {
    console.error("Error deleting video: ", error);
    return { message: "Error deleting video.", type: "error" };
  }
}
