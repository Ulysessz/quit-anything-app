ALTER TABLE `profiles` ADD `reminder_enabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `reminder_days` text DEFAULT 'Mon,Tue,Wed,Thu,Fri' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `reminder_time` text DEFAULT '16:30' NOT NULL;