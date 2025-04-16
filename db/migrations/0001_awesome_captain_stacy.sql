PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '2025-04-16T14:32:41.124Z' NOT NULL,
	`updated_at` text DEFAULT '2025-04-16T14:32:41.124Z' NOT NULL
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
	`thumbTimestamp` integer DEFAULT 1000 NOT NULL,
	`isFavorite` integer DEFAULT false NOT NULL,
	`duration` text NOT NULL,
	`fileSize` text NOT NULL,
	`orientation` text NOT NULL,
	`created_at` text DEFAULT '2025-04-16T14:32:41.114Z' NOT NULL,
	`updated_at` text DEFAULT '2025-04-16T14:32:41.123Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_videos`("id", "title", "videoUri", "thumbUri", "thumbTimestamp", "isFavorite", "duration", "fileSize", "orientation", "created_at", "updated_at") SELECT "id", "title", "videoUri", "thumbUri", "thumbTimestamp", "isFavorite", "duration", "fileSize", "orientation", "created_at", "updated_at" FROM `videos`;--> statement-breakpoint
DROP TABLE `videos`;--> statement-breakpoint
ALTER TABLE `__new_videos` RENAME TO `videos`;