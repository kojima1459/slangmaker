CREATE TABLE `favorite_skins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skinKey` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_skins_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorite_skins_userId_skinKey_unique` UNIQUE(`userId`,`skinKey`)
);
--> statement-breakpoint
ALTER TABLE `favorite_skins` ADD CONSTRAINT `favorite_skins_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;