CREATE TABLE `analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`total_capsules` integer DEFAULT 0 NOT NULL,
	`total_users` integer DEFAULT 0 NOT NULL,
	`new_capsules` integer DEFAULT 0 NOT NULL,
	`new_users` integer DEFAULT 0 NOT NULL,
	`total_verifications` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `capsules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token_id` integer NOT NULL,
	`wallet_address` text NOT NULL,
	`content_hash` text NOT NULL,
	`description` text,
	`location` text,
	`ipfs_hash` text,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`block_number` integer,
	`transaction_hash` text,
	`gas_used` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `capsules_token_id_unique` ON `capsules` (`token_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `capsules_content_hash_unique` ON `capsules` (`content_hash`);--> statement-breakpoint
CREATE TABLE `content_metadata` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`capsule_id` integer NOT NULL,
	`content_type` text,
	`file_size` integer,
	`dimensions` text,
	`duration` integer,
	`tags` text,
	`custom_fields` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`capsule_id`) REFERENCES `capsules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_metadata_capsule_id_unique` ON `content_metadata` (`capsule_id`);--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wallet_address` text NOT NULL,
	`total_capsules` integer DEFAULT 0 NOT NULL,
	`public_capsules` integer DEFAULT 0 NOT NULL,
	`private_capsules` integer DEFAULT 0 NOT NULL,
	`total_verifications` integer DEFAULT 0 NOT NULL,
	`first_capsule_at` integer,
	`last_capsule_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_stats_wallet_address_unique` ON `user_stats` (`wallet_address`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wallet_address` text NOT NULL,
	`username` text,
	`email` text,
	`avatar` text,
	`bio` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_wallet_address_unique` ON `users` (`wallet_address`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`capsule_id` integer NOT NULL,
	`verifier_address` text NOT NULL,
	`verified_at` integer NOT NULL,
	`verification_method` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`capsule_id`) REFERENCES `capsules`(`id`) ON UPDATE no action ON DELETE no action
);
