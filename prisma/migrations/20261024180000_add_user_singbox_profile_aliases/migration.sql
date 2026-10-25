CREATE TABLE "user_singbox_profile_aliases" (
    "user_id" BIGINT NOT NULL,
    "config_profile_uuid" UUID NOT NULL,
    "remark" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_singbox_profile_aliases_pkey" PRIMARY KEY ("user_id", "config_profile_uuid")
);

CREATE INDEX "user_singbox_profile_aliases_config_profile_uuid_idx"
ON "user_singbox_profile_aliases"("config_profile_uuid");

ALTER TABLE "user_singbox_profile_aliases"
ADD CONSTRAINT "user_singbox_profile_aliases_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_singbox_profile_aliases"
ADD CONSTRAINT "user_singbox_profile_aliases_config_profile_uuid_fkey"
FOREIGN KEY ("config_profile_uuid") REFERENCES "config_profiles"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
