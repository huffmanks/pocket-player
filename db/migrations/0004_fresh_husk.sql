DROP INDEX `videos_thumb_uri_idx`;--> statement-breakpoint
CREATE INDEX `videos_thumb_timestamp_idx` ON `videos` (`thumb_timestamp`);