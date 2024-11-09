import * as FileSystem from "expo-file-system";

import { eq, sql } from "drizzle-orm";
import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

import { db } from "@/db/drizzle";
import { playlistVideos, tags, videoTags, videos } from "@/db/schema";
import { AnySQLiteSelect } from "drizzle-orm/sqlite-core";

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

export function getHomeScreenQuery(
  database: ExpoSQLiteDatabase<Record<string, never>> | SQLJsDatabase | null
) {
  // @ts-expect-error
  return database?.select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      isFavorite: videos.isFavorite,
      thumbUri: videos.thumbUri,
      videoUri: videos.videoUri,
      createdAt: videos.createdAt,
      updatedAt: videos.updatedAt,
      hasPlaylist: sql`EXISTS (
  SELECT 1 FROM ${playlistVideos}
  WHERE ${playlistVideos.videoId} = ${videos.id}
)`,
      tags: sql<string>`COALESCE(
  (
    SELECT CASE
      WHEN COUNT(*) = 0 THEN '[]'
      ELSE json_group_array(
        json_object(
          'id', ${tags.id},
          'title', ${tags.title}
        )
      )
    END
    FROM ${videoTags}
    JOIN ${tags} ON ${tags.id} = ${videoTags.tagId}
    WHERE ${videoTags.videoId} = ${videos.id}
  ),
  '[]'
)`,
    })
    .from(videos) as AnySQLiteSelect;
}

export function getFavoritesScreenQuery(
  database: ExpoSQLiteDatabase<Record<string, never>> | SQLJsDatabase | null
) {
  // @ts-expect-error
  return database?.select({
      id: videos.id,
      title: videos.title,
      description: videos.description,
      isFavorite: videos.isFavorite,
      thumbUri: videos.thumbUri,
      videoUri: videos.videoUri,
      createdAt: videos.createdAt,
      updatedAt: videos.updatedAt,
      hasPlaylist: sql`EXISTS (
  SELECT 1 FROM ${playlistVideos}
  WHERE ${playlistVideos.videoId} = ${videos.id}
)`,
      tags: sql<string>`COALESCE(
  (
    SELECT CASE
      WHEN COUNT(*) = 0 THEN '[]'
      ELSE json_group_array(
        json_object(
          'id', ${tags.id},
          'title', ${tags.title}
        )
      )
    END
    FROM ${videoTags}
    JOIN ${tags} ON ${tags.id} = ${videoTags.tagId}
    WHERE ${videoTags.videoId} = ${videos.id}
  ),
  '[]'
)`,
    })
    .from(videos)
    .where(eq(videos.isFavorite, true)) as AnySQLiteSelect;
}
