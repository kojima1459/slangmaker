CREATE TABLE `share_links` (
	`id` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`sourceUrl` text NOT NULL,
	`skin` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `share_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transform_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`site` varchar(255),
	`lang` varchar(10) DEFAULT 'ja',
	`skin` varchar(64) NOT NULL,
	`params` text NOT NULL,
	`snippet` text,
	`outputHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transform_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`encryptedApiKey` text,
	`defaultSkin` varchar(64) DEFAULT 'kansai_banter',
	`defaultTemperature` int DEFAULT 130,
	`defaultTopP` int DEFAULT 90,
	`defaultMaxTokens` int DEFAULT 220,
	`defaultLengthRatio` int DEFAULT 100,
	`safetyLevel` varchar(32) DEFAULT 'moderate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `share_links` ADD CONSTRAINT `share_links_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transform_history` ADD CONSTRAINT `transform_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;