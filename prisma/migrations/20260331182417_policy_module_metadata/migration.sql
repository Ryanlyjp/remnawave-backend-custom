-- AlterTable
ALTER TABLE "config_profile_snippets"
ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "kind" VARCHAR(32),
ADD COLUMN     "scope" VARCHAR(32);
