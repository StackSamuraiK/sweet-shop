/*
  Warnings:

  - You are about to drop the column `email` on the `Sweet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Sweet_email_key";

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sweet" DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "Shop_email_key" ON "Shop"("email");
