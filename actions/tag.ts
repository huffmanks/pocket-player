import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray } from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";

import { db } from "@/db/drizzle";
import { tags, videoTags } from "@/db/schema";

export async function addOrCreateTagsForVideo(
  tx: SQLiteTransaction<"sync", unknown, any, any>,
  videoId: string,
  tagTitles: string[]
) {
  const tagIds: string[] = [];

  const existingVideoTags = await tx
    .select({ tagId: videoTags.tagId })
    .from(videoTags)
    .where(eq(videoTags.videoId, videoId));

  const existingTagIds = new Set(existingVideoTags.map((tag) => tag.tagId));

  for (const title of tagTitles) {
    let [tag] = await tx
      .select({ id: tags.id, title: tags.title })
      .from(tags)
      .where(eq(tags.title, title));

    if (!tag) {
      const newTagId = createId();
      await tx.insert(tags).values({ id: newTagId, title });
      tag = { id: newTagId, title };
    }

    if (!existingTagIds.has(tag.id)) {
      tagIds.push(tag.id);
    } else {
      existingTagIds.delete(tag.id);
    }
  }

  if (tagIds.length) {
    await tx.insert(videoTags).values(tagIds.map((tagId) => ({ videoId, tagId })));
  }

  if (existingTagIds.size) {
    await tx
      .delete(videoTags)
      .where(
        and(eq(videoTags.videoId, videoId), inArray(videoTags.tagId, Array.from(existingTagIds)))
      );
  }
}

export async function getTagsForVideo(videoId: string) {
  return await db
    .select({
      id: tags.id,
      title: tags.title,
      createdAt: tags.createdAt,
      videoId: videoTags.videoId,
    })
    .from(tags)
    .innerJoin(videoTags, eq(videoTags.tagId, tags.id))
    .where(eq(videoTags.videoId, videoId));
}
