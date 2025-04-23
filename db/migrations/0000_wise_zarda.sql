CREATE TABLE `playlist_videos` (
	`playlist_id` text NOT NULL,
	`video_id` text NOT NULL,
	`order` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `playlist_videos_playlist_id_idx` ON `playlist_videos` (`playlist_id`);--> statement-breakpoint
CREATE INDEX `playlist_videos_video_id_idx` ON `playlist_videos` (`video_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_videos_playlist_id_video_id_unique` ON `playlist_videos` (`playlist_id`,`video_id`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '2025-04-23T17:16:13.777Z' NOT NULL,
	`updated_at` text DEFAULT '2025-04-23T17:16:13.777Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlists_title_unique` ON `playlists` (`title`);--> statement-breakpoint
CREATE TABLE `videos` (
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
	`created_at` text DEFAULT '2025-04-23T17:16:13.775Z' NOT NULL,
	`updated_at` text DEFAULT '2025-04-23T17:16:13.777Z' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `videos_thumb_uri_idx` ON `videos` (`thumb_uri`);