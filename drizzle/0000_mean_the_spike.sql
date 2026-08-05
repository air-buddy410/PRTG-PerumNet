CREATE TABLE `device_metadata` (
	`prtg_device_id` text PRIMARY KEY NOT NULL,
	`custom_name` text NOT NULL,
	`ip_address` text NOT NULL,
	`device_group` text NOT NULL,
	`area_name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `device_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`recorded_at` text NOT NULL,
	`cpu_percent` real NOT NULL,
	`ram_percent` real NOT NULL,
	`temperature_c` real NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `device_metrics_device_time_idx` ON `device_metrics` (`prtg_device_id`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `port_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`port_name` text NOT NULL,
	`recorded_at` text NOT NULL,
	`download_mbps` real NOT NULL,
	`upload_mbps` real NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `port_metrics_device_port_time_idx` ON `port_metrics` (`prtg_device_id`,`port_name`,`recorded_at`);