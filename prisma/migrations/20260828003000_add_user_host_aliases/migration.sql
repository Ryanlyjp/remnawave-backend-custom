CREATE TABLE "user_host_aliases" (
    "user_id" BIGINT NOT NULL,
    "host_uuid" UUID NOT NULL,
    "remark" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_host_aliases_pkey" PRIMARY KEY ("user_id", "host_uuid")
);

CREATE INDEX "user_host_aliases_host_uuid_idx" ON "user_host_aliases"("host_uuid");

ALTER TABLE "user_host_aliases"
ADD CONSTRAINT "user_host_aliases_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("t_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_host_aliases"
ADD CONSTRAINT "user_host_aliases_host_uuid_fkey"
FOREIGN KEY ("host_uuid") REFERENCES "hosts"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
