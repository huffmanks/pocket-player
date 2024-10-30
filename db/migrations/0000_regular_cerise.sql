CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`videoUri` text NOT NULL,
	`thumbUri` text NOT NULL,
	`isFavorite` integer DEFAULT false,
	`created_at` text DEFAULT '2024-10-30T16:44:06.317Z'
);
