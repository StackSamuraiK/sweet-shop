/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Sweet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Sweet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sweet" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sweet_email_key" ON "Sweet"("email");
