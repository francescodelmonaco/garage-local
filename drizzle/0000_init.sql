CREATE TYPE "public"."financing_balloon_outcome_enum" AS ENUM('Riscatto', 'Restituzione');--> statement-breakpoint
CREATE TYPE "public"."fuel_type_enum" AS ENUM('Benzina', 'Diesel', 'GPL', 'Metano', 'Benzina + GPL', 'Benzina + Metano', 'Elettrico', 'Ibrido', 'Ibrido Plug-in', 'Idrogeno', 'Altro');--> statement-breakpoint
CREATE TYPE "public"."insurance_company_enum" AS ENUM('Linear', 'Quixa', 'Verti', 'Prima', 'Allianz Direct', 'Genertel', 'ConTe.it', 'Admiral', 'Genialloyd', 'Direct Line', 'Generali', 'Allianz', 'UnipolSai', 'Unipol', 'Reale Mutua', 'Zurich', 'AXA', 'Poste Italiane', 'Sara Assicurazioni', 'Cattolica Assicurazioni', 'Vittoria Assicurazioni', 'HDI Assicurazioni', 'Groupama', 'Itas Mutua', 'Helvetia', 'Aviva', 'Italiana Assicurazioni', 'Arca Assicurazioni', 'Alleanza Assicurazioni', 'Yolo', 'BeRebel', 'Ego Insurance', 'Net Insurance', 'Nobis Assicurazioni', 'Tua Assicurazioni', 'Wopta Assicurazioni', 'B2C Innovation', 'Connexa InsTech', 'FIT', 'Bene Assicurazioni', 'Intesa Sanpaolo', 'BNL Gruppo BNP Paribas', 'Amex Agenzia Assicurativa', 'Altro');--> statement-breakpoint
CREATE TYPE "public"."insurance_coverage_enum" AS ENUM('RCA', 'RCA + Furto e Incendio', 'RCA + Kasko', 'Kasko completa', 'Mini Kasko', 'Altro');--> statement-breakpoint
CREATE TYPE "public"."maintenance_type_enum" AS ENUM('Tagliando', 'Cambio olio', 'Filtri', 'Freni', 'Pneumatici', 'Batteria', 'Cinghia distribuzione', 'Candele', 'Liquidi', 'Climatizzatore', 'Sospensioni', 'Scarico', 'Elettronica', 'Carrozzeria', 'Altro');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type_enum" AS ENUM('Auto', 'Moto', 'Scooter', 'Furgone', 'Camper', 'Autocarro', 'Quad', 'Altro');--> statement-breakpoint
CREATE TABLE "insurances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"company" "insurance_company_enum" NOT NULL,
	"policy_number" text,
	"coverage_type" "insurance_coverage_enum",
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"cost" numeric NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "insurances_valid_details" CHECK ("insurances"."end_date" >= "insurances"."start_date" and "insurances"."cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "maintenances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "maintenance_type_enum" NOT NULL,
	"date" date NOT NULL,
	"km_at_maintenance" numeric,
	"cost" numeric,
	"workshop" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "maintenances_valid_details" CHECK ("maintenances"."title" ~ '[^[:space:]]'
    and ("maintenances"."cost" is null or "maintenances"."cost" >= 0) and ("maintenances"."km_at_maintenance" is null or "maintenances"."km_at_maintenance" >= 0))
);
--> statement-breakpoint
CREATE TABLE "refuelings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"date" date NOT NULL,
	"cost" numeric NOT NULL,
	"liters" numeric NOT NULL,
	"price_per_liter" numeric,
	"fuel_type" "fuel_type_enum",
	"station" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refuelings_valid_details" CHECK ("refuelings"."cost" > 0 and "refuelings"."liters" > 0 and ("refuelings"."price_per_liter" is null or "refuelings"."price_per_liter" > 0))
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"date" date NOT NULL,
	"next_revision_date" date NOT NULL,
	"km" numeric,
	"cost" numeric,
	"workshop" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "revisions_valid_details" CHECK ("revisions"."next_revision_date" > "revisions"."date"
    and ("revisions"."cost" is null or "revisions"."cost" >= 0) and ("revisions"."km" is null or "revisions"."km" >= 0))
);
--> statement-breakpoint
CREATE TABLE "taxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"amount" numeric NOT NULL,
	"paid_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "taxes_valid_details" CHECK ("taxes"."year" between 1886 and 9999 and "taxes"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "vehicle_financings" (
	"vehicle_id" uuid PRIMARY KEY NOT NULL,
	"down_payment" numeric DEFAULT 0 NOT NULL,
	"upfront_fees" numeric DEFAULT 0 NOT NULL,
	"installment_amount" numeric NOT NULL,
	"installment_count" integer NOT NULL,
	"first_installment_date" date NOT NULL,
	"balloon_payment" numeric,
	"balloon_outcome" "financing_balloon_outcome_enum",
	"payoff_date" date,
	"payoff_amount" numeric,
	"lender" text,
	"dealer" text,
	"contract_number" text,
	"financed_amount" numeric,
	"tan" numeric,
	"taeg" numeric,
	"guaranteed_future_value" numeric,
	"collection_fee" numeric,
	"credit_insurance" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_financings_amounts" CHECK ("vehicle_financings"."down_payment" >= 0 and "vehicle_financings"."upfront_fees" >= 0 and "vehicle_financings"."installment_amount" >= 0
    and "vehicle_financings"."installment_count" between 1 and 600
    and ("vehicle_financings"."balloon_payment" is null or "vehicle_financings"."balloon_payment" >= 0)
    and ("vehicle_financings"."payoff_amount" is null or "vehicle_financings"."payoff_amount" >= 0)
    and ("vehicle_financings"."financed_amount" is null or "vehicle_financings"."financed_amount" >= 0)
    and ("vehicle_financings"."guaranteed_future_value" is null or "vehicle_financings"."guaranteed_future_value" >= 0)
    and ("vehicle_financings"."collection_fee" is null or "vehicle_financings"."collection_fee" >= 0)
    and ("vehicle_financings"."tan" is null or "vehicle_financings"."tan" between 0 and 100)
    and ("vehicle_financings"."taeg" is null or "vehicle_financings"."taeg" between 0 and 100)),
	CONSTRAINT "vehicle_financings_balloon" CHECK ("vehicle_financings"."balloon_outcome" is null or "vehicle_financings"."balloon_payment" is not null),
	CONSTRAINT "vehicle_financings_payoff" CHECK (("vehicle_financings"."payoff_date" is null) = ("vehicle_financings"."payoff_amount" is null)
    and ("vehicle_financings"."payoff_date" is null or ("vehicle_financings"."payoff_date" >= "vehicle_financings"."first_installment_date"
      and "vehicle_financings"."payoff_date" <= "vehicle_financings"."first_installment_date" + make_interval(months => "vehicle_financings"."installment_count"))))
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"plate" text DEFAULT '' NOT NULL,
	"vehicle_type" "vehicle_type_enum" NOT NULL,
	"fuel_type" "fuel_type_enum",
	"year" integer,
	"initial_km" numeric,
	"purchase_date" date,
	"purchase_price" numeric,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_required_details" CHECK ("vehicles"."brand" ~ '[^[:space:]]' and "vehicles"."model" ~ '[^[:space:]]'),
	CONSTRAINT "vehicles_valid_numbers" CHECK (("vehicles"."year" is null or "vehicles"."year" between 1886 and 9999)
    and ("vehicles"."initial_km" is null or "vehicles"."initial_km" >= 0)
    and ("vehicles"."purchase_price" is null or "vehicles"."purchase_price" >= 0))
);
--> statement-breakpoint
ALTER TABLE "insurances" ADD CONSTRAINT "insurances_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refuelings" ADD CONSTRAINT "refuelings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxes" ADD CONSTRAINT "taxes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_financings" ADD CONSTRAINT "vehicle_financings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "insurances_vehicle_id_idx" ON "insurances" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "insurances_vehicle_end_date_idx" ON "insurances" USING btree ("vehicle_id","end_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "maintenances_vehicle_id_idx" ON "maintenances" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "refuelings_vehicle_id_idx" ON "refuelings" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "revisions_vehicle_id_idx" ON "revisions" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "revisions_vehicle_next_revision_date_idx" ON "revisions" USING btree ("vehicle_id","next_revision_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "taxes_vehicle_id_idx" ON "taxes" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "taxes_vehicle_latest_idx" ON "taxes" USING btree ("vehicle_id","year" DESC NULLS LAST,"paid_date" DESC NULLS LAST,"id" DESC NULLS LAST);