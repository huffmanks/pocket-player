CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`fileUri` text NOT NULL,
	`created_at` text DEFAULT '2024-10-28T01:45:17.395Z'
);
