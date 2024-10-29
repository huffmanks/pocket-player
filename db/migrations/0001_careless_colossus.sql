PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`fileUri` text NOT NULL,
	`isFavorite` integer DEFAULT false,
	`created_at` text DEFAULT '2024-10-29T15:41:17.911Z'
);
--> statement-breakpoint
INSERT INTO `__new_videos`("id", "title", "fileUri", "isFavorite", "created_at") SELECT "id", "title", "fileUri", "isFavorite", "created_at" FROM `videos`;--> statement-breakpoint
DROP TABLE `videos`;--> statement-breakpoint
ALTER TABLE `__new_videos` RENAME TO `videos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;