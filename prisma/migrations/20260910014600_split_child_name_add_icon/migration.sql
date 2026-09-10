-- AlterTable
ALTER TABLE "child_profiles" ADD COLUMN "firstName" TEXT;
ALTER TABLE "child_profiles" ADD COLUMN "lastName" TEXT;
ALTER TABLE "child_profiles" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'baby';

UPDATE "child_profiles"
SET
  "firstName" = CASE
    WHEN position(' ' in "name") > 0 THEN split_part("name", ' ', 1)
    ELSE "name"
  END,
  "lastName" = CASE
    WHEN position(' ' in "name") > 0 THEN substr("name", position(' ' in "name") + 1)
    ELSE ''
  END;

ALTER TABLE "child_profiles" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "child_profiles" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "child_profiles" DROP COLUMN "name";
