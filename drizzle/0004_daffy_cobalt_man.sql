CREATE TABLE `custom_skins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`example` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_skins_id` PRIMARY KEY(`id`),
	CONSTRAINT `custom_skins_userId_key_unique` UNIQUE(`userId`,`key`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_settings` MODIFY COLUMN `defaultMaxTokens` int DEFAULT 4000;--> statement-breakpoint
ALTER TABLE `favorite_skins` ADD `orderIndex` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `transform_history` ADD `extracted` text;--> statement-breakpoint
ALTER TABLE `transform_history` ADD `output` text;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`);--> statement-breakpoint
ALTER TABLE `custom_skins` ADD CONSTRAINT `custom_skins_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_limits` ADD CONSTRAINT `rate_limits_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;