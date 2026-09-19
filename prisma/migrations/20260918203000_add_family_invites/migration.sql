-- Pending invitations. Only the token hash is stored.
CREATE TABLE "family_invites" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "relationship" TEXT,
    "tokenHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedById" TEXT,
    "acceptedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "family_invites_tokenHash_key" ON "family_invites"("tokenHash");

CREATE INDEX "family_invites_familyId_idx" ON "family_invites"("familyId");

CREATE INDEX "family_invites_status_idx" ON "family_invites"("status");

ALTER TABLE "family_invites" ADD CONSTRAINT "family_invites_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "family_invites" ADD CONSTRAINT "family_invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Which household a member is currently viewing
ALTER TABLE "parents" ADD COLUMN "activeFamilyId" TEXT;

ALTER TABLE "parents" ADD CONSTRAINT "parents_activeFamilyId_fkey" FOREIGN KEY ("activeFamilyId") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Superseded by family_memberships and family_invites. Verified empty before dropping.
DROP TABLE "family_members";
