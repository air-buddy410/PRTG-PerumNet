CREATE TABLE `metric_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`metric` text NOT NULL,
	`resolution` text NOT NULL,
	`bucket_start` text NOT NULL,
	`value_avg` real NOT NULL,
	`value_min` real NOT NULL,
	`value_max` real NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metric_history_device_metric_res_bucket_idx` ON `metric_history` (`prtg_device_id`,`metric`,`resolution`,`bucket_start`);