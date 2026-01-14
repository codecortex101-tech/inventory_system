-- DropIndex
DROP INDEX IF EXISTS "users_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_organization_id_key" ON "users"("email", "organization_id");
