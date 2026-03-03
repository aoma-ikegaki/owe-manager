PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_debts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`amount` integer NOT NULL,
	`creditor` text NOT NULL,
	`du_date` text,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT '"2026-03-03T07:13:39.044Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_debts`("id", "title", "amount", "creditor", "du_date", "status", "user_id", "created_at") SELECT "id", "title", "amount", "creditor", "du_date", "status", "user_id", "created_at" FROM `debts`;--> statement-breakpoint
DROP TABLE `debts`;--> statement-breakpoint
ALTER TABLE `__new_debts` RENAME TO `debts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `user` ADD `is_anonymous` integer;