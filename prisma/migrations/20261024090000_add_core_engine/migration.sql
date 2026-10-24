ALTER TABLE "config_profiles"
ADD COLUMN "engine" VARCHAR(16) NOT NULL DEFAULT 'XRAY';

ALTER TABLE "config_profile_snippets"
ADD COLUMN "engine" VARCHAR(16) NOT NULL DEFAULT 'XRAY';

ALTER TABLE "config_profile_snippets"
DROP CONSTRAINT "config_profile_snippets_pkey",
ADD CONSTRAINT "config_profile_snippets_pkey" PRIMARY KEY ("engine", "name");
