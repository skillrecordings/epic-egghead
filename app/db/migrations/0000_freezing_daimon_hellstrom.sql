CREATE TABLE `inngest-gpt_contentContribution` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`contentId` text NOT NULL,
	`contributionTypeId` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `inngest-gpt_contentResource` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`createdById` text NOT NULL,
	`fields` text DEFAULT [object Object],
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE TABLE `inngest-gpt_contentResourceResource` (
	`resourceOfId` text NOT NULL,
	`resourceId` text NOT NULL,
	`position` real DEFAULT 0 NOT NULL,
	`metadata` text DEFAULT [object Object],
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP,
	`deletedAt` integer,
	PRIMARY KEY(`resourceId`, `resourceOfId`)
);
--> statement-breakpoint
CREATE TABLE `inngest-gpt_contributionType` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`active` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP,
	`deletedAt` integer
);
--> statement-breakpoint
CREATE INDEX `userId` ON `inngest-gpt_contentContribution` (`userId`);--> statement-breakpoint
CREATE INDEX `contentId` ON `inngest-gpt_contentContribution` (`contentId`);--> statement-breakpoint
CREATE INDEX `contributionTypeId` ON `inngest-gpt_contentContribution` (`contributionTypeId`);--> statement-breakpoint
CREATE INDEX `typeId` ON `inngest-gpt_contentResource` (`type`);--> statement-breakpoint
CREATE INDEX `createdBy` ON `inngest-gpt_contentResource` (`createdById`);--> statement-breakpoint
CREATE INDEX `createdAt` ON `inngest-gpt_contentResource` (`createdAt`);--> statement-breakpoint
CREATE INDEX `contentResourceId` ON `inngest-gpt_contentResourceResource` (`resourceOfId`);--> statement-breakpoint
CREATE INDEX `resourceId` ON `inngest-gpt_contentResourceResource` (`resourceId`);--> statement-breakpoint
CREATE UNIQUE INDEX `inngest-gpt_contributionType_slug_unique` ON `inngest-gpt_contributionType` (`slug`);--> statement-breakpoint
CREATE INDEX `name` ON `inngest-gpt_contributionType` (`name`);--> statement-breakpoint
CREATE INDEX `slug` ON `inngest-gpt_contributionType` (`slug`);