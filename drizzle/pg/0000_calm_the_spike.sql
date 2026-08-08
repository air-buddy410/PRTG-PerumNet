CREATE TABLE "assets" (
	"asset_id" text PRIMARY KEY NOT NULL,
	"librenms_device_id" integer,
	"hostname" text NOT NULL,
	"display_name" text NOT NULL,
	"management_ip" text NOT NULL,
	"vendor" text NOT NULL,
	"os" text,
	"model" text,
	"serial_number" text,
	"site" text NOT NULL,
	"location" text,
	"latitude" double precision,
	"longitude" double precision,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"network_role" text NOT NULL,
	"crm_customer_id" text,
	"crm_service_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_librenms_device_id_unique" UNIQUE("librenms_device_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"actor_label" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_service_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"external_customer_id" text NOT NULL,
	"external_service_id" text NOT NULL,
	"asset_id" text,
	"librenms_group" text,
	"sync_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" text PRIMARY KEY NOT NULL,
	"librenms_alert_id" text NOT NULL,
	"asset_id" text,
	"device_name" text NOT NULL,
	"severity" text NOT NULL,
	"state" text DEFAULT 'open' NOT NULL,
	"message" text NOT NULL,
	"triggered_at" timestamp with time zone NOT NULL,
	"recovered_at" timestamp with time zone,
	"acknowledged_by" text,
	"acknowledged_at" timestamp with time zone,
	"resolution_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"recipient_name" text NOT NULL,
	"target" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"verification_code" text,
	"chat_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text,
	"channel_id" text,
	"channel_type" text NOT NULL,
	"target" text NOT NULL,
	"status" text NOT NULL,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"librenms_alert_id" text NOT NULL,
	"device_name" text NOT NULL,
	"alert_type" text NOT NULL,
	"message_content" text NOT NULL,
	"status" text NOT NULL,
	"resolution_note" text,
	"triggered_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sla_monthly" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"period" text NOT NULL,
	"uptime_percent" double precision NOT NULL,
	"downtime_minutes" integer NOT NULL,
	"incidents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sla_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"report_name" text NOT NULL,
	"report_type" text NOT NULL,
	"format_type" text NOT NULL,
	"period" text NOT NULL,
	"user_id" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topologies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_version" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topology_discovery_suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"topology_id" text NOT NULL,
	"kind" text NOT NULL,
	"source" text NOT NULL,
	"confidence" text NOT NULL,
	"payload" jsonb NOT NULL,
	"state" text DEFAULT 'pending' NOT NULL,
	"discovered_at" timestamp with time zone NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "topology_links" (
	"id" text PRIMARY KEY NOT NULL,
	"topology_id" text NOT NULL,
	"source_node_id" text NOT NULL,
	"target_node_id" text NOT NULL,
	"source_port" text,
	"target_port" text,
	"media_type" text,
	"capacity_mbps" integer,
	"direction" text DEFAULT 'bi' NOT NULL,
	"status" text DEFAULT 'unknown' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topology_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"topology_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topology_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"topology_id" text NOT NULL,
	"version" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"published_by" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traffic_monthly" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"period" text NOT NULL,
	"download_gb" double precision NOT NULL,
	"upload_gb" double precision NOT NULL,
	"avg_mbps" double precision NOT NULL,
	"peak_mbps" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text DEFAULT 'engineer',
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_service_mappings" ADD CONSTRAINT "crm_service_mappings_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_acknowledged_by_user_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_channel_id_notification_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."notification_channels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_monthly" ADD CONSTRAINT "sla_monthly_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sla_reports" ADD CONSTRAINT "sla_reports_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topologies" ADD CONSTRAINT "topologies_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_discovery_suggestions" ADD CONSTRAINT "topology_discovery_suggestions_topology_id_topologies_id_fk" FOREIGN KEY ("topology_id") REFERENCES "public"."topologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_discovery_suggestions" ADD CONSTRAINT "topology_discovery_suggestions_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_links" ADD CONSTRAINT "topology_links_topology_id_topologies_id_fk" FOREIGN KEY ("topology_id") REFERENCES "public"."topologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_links" ADD CONSTRAINT "topology_links_source_node_id_topology_nodes_id_fk" FOREIGN KEY ("source_node_id") REFERENCES "public"."topology_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_links" ADD CONSTRAINT "topology_links_target_node_id_topology_nodes_id_fk" FOREIGN KEY ("target_node_id") REFERENCES "public"."topology_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_nodes" ADD CONSTRAINT "topology_nodes_topology_id_topologies_id_fk" FOREIGN KEY ("topology_id") REFERENCES "public"."topologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_nodes" ADD CONSTRAINT "topology_nodes_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_versions" ADD CONSTRAINT "topology_versions_topology_id_topologies_id_fk" FOREIGN KEY ("topology_id") REFERENCES "public"."topologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topology_versions" ADD CONSTRAINT "topology_versions_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traffic_monthly" ADD CONSTRAINT "traffic_monthly_asset_id_assets_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("asset_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "crm_service_mappings_service_idx" ON "crm_service_mappings" USING btree ("external_customer_id","external_service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "incidents_active_alert_idx" ON "incidents" USING btree ("librenms_alert_id") WHERE "incidents"."state" <> 'resolved';--> statement-breakpoint
CREATE UNIQUE INDEX "sla_monthly_asset_period_idx" ON "sla_monthly" USING btree ("asset_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "topology_nodes_topology_asset_idx" ON "topology_nodes" USING btree ("topology_id","asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topology_versions_topology_version_idx" ON "topology_versions" USING btree ("topology_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "traffic_monthly_asset_period_idx" ON "traffic_monthly" USING btree ("asset_id","period");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");