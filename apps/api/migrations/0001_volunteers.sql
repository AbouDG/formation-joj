CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slot_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"registered_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"discipline_id" uuid NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"capacity" integer NOT NULL,
	"created_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "slots_capacity_check" CHECK ("slots"."capacity" >= 1),
	CONSTRAINT "slots_time_range_check" CHECK ("slots"."end_time" > "slots"."start_time")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_discipline_id_disciplines_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "registrations_slot_id_idx" ON "registrations" USING btree ("slot_id");