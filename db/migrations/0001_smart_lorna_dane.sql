PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
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
	`video_uri` text NOT NULL,
	`thumb_uri` text NOT NULL,
	`thumb_timestamp` integer DEFAULT 3000 NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`file_extension` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_size_label` text NOT NULL,
	`duration` real NOT NULL,
	`duration_label` text NOT NULL,
	`orientation` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`resolution` text NOT NULL,
	`fps` integer NOT NULL,
	`has_audio` integer NOT NULL,
	`video_codec` text,
	`audio_codec` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_videos`("id", "title", "video_uri", "thumb_uri", "thumb_timestamp", "is_favorite", "file_extension", "file_size", "file_size_label", "duration", "duration_label", "orientation", "width", "height", "resolution", "fps", "has_audio", "video_codec", "audio_codec", "created_at", "updated_at") SELECT "id", "title", "video_uri", "thumb_uri", "thumb_timestamp", "is_favorite", "file_extension", "file_size", "file_size_label", "duration", "duration_label", "orientation", "width", "height", "resolution", "fps", "has_audio", "video_codec", "audio_codec", "created_at", "updated_at" FROM `videos`;--> statement-breakpoint
DROP TABLE `videos`;--> statement-breakpoint
ALTER TABLE `__new_videos` RENAME TO `videos`;--> statement-breakpoint
CREATE INDEX `videos_thumb_uri_idx` ON `videos` (`thumb_uri`);