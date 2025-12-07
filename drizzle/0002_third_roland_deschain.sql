CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`historyId` int NOT NULL,
	`rating` enum('good','bad') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_historyId_transform_history_id_fk` FOREIGN KEY (`historyId`) REFERENCES `transform_history`(`id`) ON DELETE cascade ON UPDATE no action;