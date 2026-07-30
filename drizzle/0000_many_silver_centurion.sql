CREATE TABLE `check_ins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`result` text NOT NULL,
	`urge_level` integer NOT NULL,
	`trigger` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`display_name` text NOT NULL,
	`habit` text NOT NULL,
	`approach` text NOT NULL,
	`reason` text NOT NULL,
	`danger_days` text DEFAULT '' NOT NULL,
	`danger_start` text DEFAULT '17:00' NOT NULL,
	`danger_end` text DEFAULT '20:00' NOT NULL,
	`replacement_plan` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_email_idx` ON `profiles` (`user_email`);