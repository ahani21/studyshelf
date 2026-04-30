-- Phase 6: AI Knowledge Generation - New Tables Migration
-- Run this in your Supabase SQL Editor (https://supabase.com → Project → SQL Editor)

-- Step 1: Allow SRSData to optionally link to Flashcards (make resourceId optional)
ALTER TABLE "SRSData" ALTER COLUMN "resourceId" DROP NOT NULL;
ALTER TABLE "SRSData" ADD COLUMN IF NOT EXISTS "flashcardId" INTEGER UNIQUE;

-- Step 2: Create Note table
CREATE TABLE IF NOT EXISTS "Note" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Create Flashcard table
CREATE TABLE IF NOT EXISTS "Flashcard" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "srsId" INTEGER UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_srsId_fkey"
    FOREIGN KEY ("srsId") REFERENCES "SRSData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Add foreign key from SRSData to Flashcard
ALTER TABLE "SRSData" ADD CONSTRAINT "SRSData_flashcardId_fkey"
    FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Create MCQ table
CREATE TABLE IF NOT EXISTS "MCQ" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[] NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MCQ_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "MCQ" ADD CONSTRAINT "MCQ_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
