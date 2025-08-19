CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"total_capsules" integer DEFAULT 0 NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"new_capsules" integer DEFAULT 0 NOT NULL,
	"new_users" integer DEFAULT 0 NOT NULL,
	"total_verifications" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capsules" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_id" integer NOT NULL,
	"wallet_address" text NOT NULL,
	"content_hash" text NOT NULL,
	"description" text,
	"location" text,
	"ipfs_hash" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"block_number" integer,
	"transaction_hash" text,
	"gas_used" integer,
	CONSTRAINT "capsules_token_id_unique" UNIQUE("token_id"),
	CONSTRAINT "capsules_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE "content_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"capsule_id" integer NOT NULL,
	"content_type" text,
	"file_size" integer,
	"dimensions" text,
	"duration" integer,
	"tags" text,
	"custom_fields" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_metadata_capsule_id_unique" UNIQUE("capsule_id")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" text NOT NULL,
	"total_capsules" integer DEFAULT 0 NOT NULL,
	"public_capsules" integer DEFAULT 0 NOT NULL,
	"private_capsules" integer DEFAULT 0 NOT NULL,
	"total_verifications" integer DEFAULT 0 NOT NULL,
	"first_capsule_at" timestamp,
	"last_capsule_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" text NOT NULL,
	"username" text,
	"email" text,
	"avatar" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"capsule_id" integer NOT NULL,
	"verifier_address" text NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	"verification_method" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "content_metadata" ADD CONSTRAINT "content_metadata_capsule_id_capsules_id_fk" FOREIGN KEY ("capsule_id") REFERENCES "public"."capsules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_capsule_id_capsules_id_fk" FOREIGN KEY ("capsule_id") REFERENCES "public"."capsules"("id") ON DELETE no action ON UPDATE no action;