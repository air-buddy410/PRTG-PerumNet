CREATE TABLE `notification_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`recipient_name` text NOT NULL,
	`target` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`verification_code` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`prtg_sensor_id` text NOT NULL,
	`device_name` text NOT NULL,
	`alert_type` text NOT NULL,
	`message_content` text NOT NULL,
	`status` text NOT NULL,
	`resolution_note` text,
	`triggered_at` text NOT NULL
);
