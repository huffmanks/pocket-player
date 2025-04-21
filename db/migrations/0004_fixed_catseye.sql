PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '2025-04-21T20:31:36.165Z' NOT NULL,
	`updated_at` text DEFAULT '2025-04-21T20:31:36.165Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_playlists`("id", "title", "description", "created_at", "updated_at") SELECT "id", "title", "description", "created_at", "updated_at" FROM `playlists`;--> statement-breakpoint
DROP TABLE `playlists`;--> statement-breakpoint
ALTER TABLE `__new_playlists` RENAME TO `playlists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `playlists_title_unique` ON `playlists` (`title`);--> statement-breakpoint
CREATE TABLE `__new_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`videoUri` text NOT NULL,
	`thumbUri` text NOT NULL,
	`thumbTimestamp` integer DEFAULT 3000 NOT NULL,
	`isFavorite` integer DEFAULT false NOT NULL,
	`fileExtension` text NOT NULL,
	`fileSize` text NOT NULL,
	`duration` real NOT NULL,
	`duration_formatted` text NOT NULL,
	`orientation` text NOT NULL,
	`orientation_full` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`fps` integer NOT NULL,
	`has_audio` integer NOT NULL,
	`videoCodec` text NOT NULL,
	`audioCodec` text NOT NULL,
	`created_at` text DEFAULT '2025-04-21T20:31:36.164Z' NOT NULL,
	`updated_at` text DEFAULT '2025-04-21T20:31:36.164Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_videos`("id", "title", "videoUri", "thumbUri", "thumbTimestamp", "isFavorite", "fileExtension", "fileSize", "duration", "duration_formatted", "orientation", "orientation_full", "width", "height", "fps", "has_audio", "videoCodec", "audioCodec", "created_at", "updated_at") SELECT "id", "title", "videoUri", "thumbUri", "thumbTimestamp", "isFavorite", "fileExtension", "fileSize", "duration", "duration_formatted", "orientation", "orientation_full", "width", "height", "fps", "has_audio", "videoCodec", "audioCodec", "created_at", "updated_at" FROM `videos`;--> statement-breakpoint
DROP TABLE `videos`;--> statement-breakpoint
ALTER TABLE `__new_videos` RENAME TO `videos`;--> statement-breakpoint
CREATE INDEX `videos_thumb_uri_idx` ON `videos` (`thumbUri`);