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
ALTER TABLE `custom_skins` ADD CONSTRAINT `custom_skins_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;