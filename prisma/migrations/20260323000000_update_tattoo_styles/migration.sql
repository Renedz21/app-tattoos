-- CreateEnum
CREATE TYPE "TattooStyle_new" AS ENUM ('COVER_UP', 'RELIGIOUS', 'PERSONALIZED', 'DOTWORK', 'SURREALISM', 'MISCELLANEOUS', 'WATERCOLOR', 'GEOMETRIC');

-- AlterTable tattoo_request
ALTER TABLE "tattoo_request" ALTER COLUMN "style" DROP DEFAULT;
ALTER TABLE "tattoo_request"
  ALTER COLUMN "style" TYPE "TattooStyle_new"
  USING 'MISCELLANEOUS'::"TattooStyle_new";
ALTER TABLE "tattoo_request" ALTER COLUMN "style" SET DEFAULT 'MISCELLANEOUS'::"TattooStyle_new";

-- AlterTable portfolio_item
ALTER TABLE "portfolio_item" ALTER COLUMN "style" DROP DEFAULT;
ALTER TABLE "portfolio_item"
  ALTER COLUMN "style" TYPE "TattooStyle_new"
  USING 'MISCELLANEOUS'::"TattooStyle_new";
ALTER TABLE "portfolio_item" ALTER COLUMN "style" SET DEFAULT 'MISCELLANEOUS'::"TattooStyle_new";

-- DropEnum old, rename new
DROP TYPE "TattooStyle";
ALTER TYPE "TattooStyle_new" RENAME TO "TattooStyle";
