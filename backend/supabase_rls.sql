-- StudyShelf Row Level Security (RLS) Policies
-- Run this script in the Supabase SQL editor to enforce data isolation

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SRSData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResourceTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResourceCollection" ENABLE ROW LEVEL SECURITY;

-- Note: Because we use Prisma with a server-side client, Prisma operations run as a superuser/service role
-- and inherently bypass RLS unless we explicitly set the user context. For safety, these policies 
-- ensure if Supabase Client is ever used directly from the frontend, it remains fully locked down.

-- 2. Resource Policies
CREATE POLICY "Users can only read their own resources" ON "Resource"
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only insert their own resources" ON "Resource"
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can only update their own resources" ON "Resource"
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can only delete their own resources" ON "Resource"
    FOR DELETE USING (user_id = auth.uid()::text);

-- 3. Collection Policies
CREATE POLICY "Users can fully manage their own collections" ON "Collection"
    FOR ALL USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

-- 4. Tag Policies
-- Tags are generic and shared. Everyone can read tags.
CREATE POLICY "Tags are public to read" ON "Tag"
    FOR SELECT USING (true);
CREATE POLICY "Any authenticated user can create tags" ON "Tag"
    FOR INSERT TO authenticated WITH CHECK (true);

-- 5. SRS Data Policies
-- Users can only see/modify SRS data belonging to their own resources
CREATE POLICY "Users can manage SRS of their own resources" ON "SRSData"
    FOR ALL USING (
        resource_id IN (SELECT id FROM "Resource" WHERE user_id = auth.uid()::text)
    );

-- 6. ResourceTag and ResourceCollection Junction Policies
CREATE POLICY "Users can manage junction tables for their resources" ON "ResourceTag"
    FOR ALL USING (
        resource_id IN (SELECT id FROM "Resource" WHERE user_id = auth.uid()::text)
    );

CREATE POLICY "Users can manage collection maps for their resources" ON "ResourceCollection"
    FOR ALL USING (
        resource_id IN (SELECT id FROM "Resource" WHERE user_id = auth.uid()::text)
    );
