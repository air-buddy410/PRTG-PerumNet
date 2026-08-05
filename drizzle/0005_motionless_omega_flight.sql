CREATE TABLE `sla_monthly` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`period` text NOT NULL,
	`uptime_percent` real NOT NULL,
	`downtime_minutes` integer NOT NULL,
	`incidents` integer NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sla_monthly_device_period_idx` ON `sla_monthly` (`prtg_device_id`,`period`);--> statement-breakpoint
CREATE TABLE `sla_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`report_name` text NOT NULL,
	`report_type` text NOT NULL,
	`format_type` text NOT NULL,
	`period` text NOT NULL,
	`user_id` text,
	`generated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `traffic_monthly` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`period` text NOT NULL,
	`download_gb` real NOT NULL,
	`upload_gb` real NOT NULL,
	`avg_mbps` real NOT NULL,
	`peak_mbps` real NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `traffic_monthly_device_period_idx` ON `traffic_monthly` (`prtg_device_id`,`period`);