CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`fileUri` text NOT NULL,
	`isFavorite` integer DEFAULT false,
	`created_at` text DEFAULT '2024-10-29T20:46:29.154Z'
);
