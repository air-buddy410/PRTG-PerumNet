CREATE TABLE `onu_status_samples` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`port_name` text NOT NULL,
	`onu_id` text NOT NULL,
	`rx_power_dbm` real NOT NULL,
	`status` text NOT NULL,
	`recorded_at` text NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `onu_status_samples_device_port_onu_time_idx` ON `onu_status_samples` (`prtg_device_id`,`port_name`,`onu_id`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `pon_port_samples` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prtg_device_id` text NOT NULL,
	`port_name` text NOT NULL,
	`sfp_up` integer NOT NULL,
	`tx_power_dbm` real NOT NULL,
	`recorded_at` text NOT NULL,
	FOREIGN KEY (`prtg_device_id`) REFERENCES `device_metadata`(`prtg_device_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pon_port_samples_device_port_time_idx` ON `pon_port_samples` (`prtg_device_id`,`port_name`,`recorded_at`);