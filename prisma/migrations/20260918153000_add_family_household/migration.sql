-- Households. Existing parents reuse their own id as the family id so keys
-- derived from it (notably the LaunchDarkly family context) stay stable.
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "family_memberships" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "relationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "family_memberships_familyId_parentId_key" ON "family_memberships"("familyId", "parentId");

CREATE INDEX "family_memberships_parentId_idx" ON "family_memberships"("parentId");

ALTER TABLE "family_memberships" ADD CONSTRAINT "family_memberships_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "family_memberships" ADD CONSTRAINT "family_memberships_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: every existing parent gets a household and owns it
INSERT INTO "families" ("id", "createdAt", "updatedAt")
SELECT "id", "createdAt", CURRENT_TIMESTAMP FROM "parents";

INSERT INTO "family_memberships" ("id", "familyId", "parentId", "role", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", "id", 'owner', "createdAt", CURRENT_TIMESTAMP FROM "parents";

-- Move children onto their household. "parentId" is intentionally left in place
-- so pre-household code keeps working until a later contract migration.
ALTER TABLE "child_profiles" ADD COLUMN "familyId" TEXT;

UPDATE "child_profiles" SET "familyId" = "parentId";

ALTER TABLE "child_profiles" ALTER COLUMN "familyId" SET NOT NULL;

CREATE INDEX "child_profiles_familyId_idx" ON "child_profiles"("familyId");

ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
