CREATE TABLE `debts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`amount` integer NOT NULL,
	`creditor` text NOT NULL,
	`du_date` text,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`created_at` integer DEFAULT '"2026-02-13T18:14:36.578Z"' NOT NULL
);
