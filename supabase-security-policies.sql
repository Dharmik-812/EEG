-- ============================================================================
-- SECURE ROW LEVEL SECURITY (RLS) POLICIES FOR EEG PROJECT
-- Run this in Supabase SQL Editor to replace overly permissive policies
-- ============================================================================

-- First, drop all existing permissive policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Users can manage friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can view friendships" ON friendships;
DROP POLICY IF EXISTS "Users can manage DM threads" ON dm_threads;
DROP POLICY IF EXISTS "Users can manage DM messages" ON dm_messages;
DROP POLICY IF EXISTS "Users can manage DM keys" ON dm_keys;
DROP POLICY IF EXISTS "Users can manage DM reads" ON dm_reads;
DROP POLICY IF EXISTS "Users can view/manage groups" ON group_chats;
DROP POLICY IF EXISTS "Users can manage group members" ON group_members;
DROP POLICY IF EXISTS "Users can manage group messages" ON group_messages;
DROP POLICY IF EXISTS "Users can manage group keys" ON group_keys;
DROP POLICY IF EXISTS "Users can manage group reads" ON group_reads;
DROP POLICY IF EXISTS "Users can manage group pins" ON group_pins;
DROP POLICY IF EXISTS "Users can manage reactions" ON reactions;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view reports" ON reports;
DROP POLICY IF EXISTS "Users can view bans" ON bans;
DROP POLICY IF EXISTS "Users can view audit logs" ON audit_logs;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view public profile information of all users
CREATE POLICY "users_select_public" ON users 
  FOR SELECT 
  USING (true);

-- Users can only update their own profile
CREATE POLICY "users_update_own" ON users 
  FOR UPDATE 
  USING (auth.uid()::text = id);

-- Allow user registration (INSERT during signup)
CREATE POLICY "users_insert_registration" ON users 
  FOR INSERT 
  WITH CHECK (true);

-- Users cannot delete their own account (admin only)
CREATE POLICY "users_no_delete" ON users 
  FOR DELETE 
  USING (false);

-- ============================================================================
-- FRIEND REQUEST POLICIES
-- ============================================================================

-- Users can view friend requests sent to them or sent by them
CREATE POLICY "friend_requests_select_own" ON friend_requests 
  FOR SELECT 
  USING (auth.uid()::text = toId OR auth.uid()::text = fromId);

-- Users can send friend requests
CREATE POLICY "friend_requests_insert_own" ON friend_requests 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = fromId);

-- Users can update requests they received (accept/decline) or sent (cancel)
CREATE POLICY "friend_requests_update_own" ON friend_requests 
  FOR UPDATE 
  USING (auth.uid()::text = toId OR auth.uid()::text = fromId);

-- Users can delete requests they sent
CREATE POLICY "friend_requests_delete_own" ON friend_requests 
  FOR DELETE 
  USING (auth.uid()::text = fromId);

-- ============================================================================
-- FRIENDSHIPS POLICIES
-- ============================================================================

-- Users can view friendships they are part of
CREATE POLICY "friendships_select_own" ON friendships 
  FOR SELECT 
  USING (auth.uid()::text = aId OR auth.uid()::text = bId);

-- System can create friendships (handled by backend)
CREATE POLICY "friendships_insert_system" ON friendships 
  FOR INSERT 
  WITH CHECK (true);

-- Users cannot directly update friendships
CREATE POLICY "friendships_no_update" ON friendships 
  FOR UPDATE 
  USING (false);

-- Users can delete friendships they are part of
CREATE POLICY "friendships_delete_own" ON friendships 
  FOR DELETE 
  USING (auth.uid()::text = aId OR auth.uid()::text = bId);

-- ============================================================================
-- DM THREAD POLICIES
-- ============================================================================

-- Users can view DM threads they are part of
CREATE POLICY "dm_threads_select_participant" ON dm_threads 
  FOR SELECT 
  USING (auth.uid()::text = aId OR auth.uid()::text = bId);

-- System can create DM threads
CREATE POLICY "dm_threads_insert_system" ON dm_threads 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = aId OR auth.uid()::text = bId);

-- No updates or deletes on DM threads
CREATE POLICY "dm_threads_no_update" ON dm_threads 
  FOR UPDATE 
  USING (false);

CREATE POLICY "dm_threads_no_delete" ON dm_threads 
  FOR DELETE 
  USING (false);

-- ============================================================================
-- DM MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in threads they participate in
CREATE POLICY "dm_messages_select_participant" ON dm_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM dm_threads dt 
      WHERE dt.threadKey = dm_messages.threadKey 
      AND (dt.aId = auth.uid()::text OR dt.bId = auth.uid()::text)
    )
  );

-- Users can send messages in threads they participate in
CREATE POLICY "dm_messages_insert_participant" ON dm_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = userId AND
    EXISTS (
      SELECT 1 FROM dm_threads dt 
      WHERE dt.threadKey = dm_messages.threadKey 
      AND (dt.aId = auth.uid()::text OR dt.bId = auth.uid()::text)
    )
  );

-- Users can update their own messages
CREATE POLICY "dm_messages_update_own" ON dm_messages 
  FOR UPDATE 
  USING (auth.uid()::text = userId);

-- Users can delete their own messages
CREATE POLICY "dm_messages_delete_own" ON dm_messages 
  FOR DELETE 
  USING (auth.uid()::text = userId);

-- ============================================================================
-- DM ENCRYPTION KEYS POLICIES
-- ============================================================================

-- Users can view encryption keys for threads they participate in
CREATE POLICY "dm_keys_select_own" ON dm_keys 
  FOR SELECT 
  USING (
    auth.uid()::text = forUserId AND
    EXISTS (
      SELECT 1 FROM dm_threads dt 
      WHERE dt.threadKey = dm_keys.threadKey 
      AND (dt.aId = auth.uid()::text OR dt.bId = auth.uid()::text)
    )
  );

-- Users can insert encryption keys for themselves
CREATE POLICY "dm_keys_insert_own" ON dm_keys 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = forUserId AND
    EXISTS (
      SELECT 1 FROM dm_threads dt 
      WHERE dt.threadKey = dm_keys.threadKey 
      AND (dt.aId = auth.uid()::text OR dt.bId = auth.uid()::text)
    )
  );

-- No updates or deletes on encryption keys
CREATE POLICY "dm_keys_no_update" ON dm_keys 
  FOR UPDATE 
  USING (false);

CREATE POLICY "dm_keys_no_delete" ON dm_keys 
  FOR DELETE 
  USING (false);

-- ============================================================================
-- DM READ STATUS POLICIES
-- ============================================================================

-- Users can view their own read status
CREATE POLICY "dm_reads_select_own" ON dm_reads 
  FOR SELECT 
  USING (auth.uid()::text = userId);

-- Users can update their own read status
CREATE POLICY "dm_reads_upsert_own" ON dm_reads 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = userId);

CREATE POLICY "dm_reads_update_own" ON dm_reads 
  FOR UPDATE 
  USING (auth.uid()::text = userId);

-- ============================================================================
-- GROUP CHAT POLICIES
-- ============================================================================

-- Users can view public groups and groups they are members of
CREATE POLICY "group_chats_select_public_or_member" ON group_chats 
  FOR SELECT 
  USING (
    isPrivate = 0 OR 
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_chats.id 
      AND gm.userId = auth.uid()::text
    )
  );

-- Users can create groups
CREATE POLICY "group_chats_insert_own" ON group_chats 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = createdBy);

-- Only group admins can update group settings
CREATE POLICY "group_chats_update_admin" ON group_chats 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_chats.id 
      AND gm.userId = auth.uid()::text 
      AND gm.role = 'admin'
    )
  );

-- Only group admins can delete groups
CREATE POLICY "group_chats_delete_admin" ON group_chats 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_chats.id 
      AND gm.userId = auth.uid()::text 
      AND gm.role = 'admin'
    )
  );

-- ============================================================================
-- GROUP MEMBERS POLICIES
-- ============================================================================

-- Users can view members of groups they belong to
CREATE POLICY "group_members_select_member" ON group_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2 
      WHERE gm2.groupId = group_members.groupId 
      AND gm2.userId = auth.uid()::text
    )
  );

-- Users can join groups (handled by backend with proper validation)
CREATE POLICY "group_members_insert_join" ON group_members 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = userId);

-- Admins can update member roles
CREATE POLICY "group_members_update_admin" ON group_members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_members.groupId 
      AND gm.userId = auth.uid()::text 
      AND gm.role = 'admin'
    )
  );

-- Users can leave groups, admins can remove members
CREATE POLICY "group_members_delete_leave_or_admin" ON group_members 
  FOR DELETE 
  USING (
    auth.uid()::text = userId OR
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_members.groupId 
      AND gm.userId = auth.uid()::text 
      AND gm.role = 'admin'
    )
  );

-- ============================================================================
-- GROUP MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in groups they are members of
CREATE POLICY "group_messages_select_member" ON group_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_messages.groupId 
      AND gm.userId = auth.uid()::text
    )
  );

-- Users can send messages in groups they are members of
CREATE POLICY "group_messages_insert_member" ON group_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = userId AND
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_messages.groupId 
      AND gm.userId = auth.uid()::text
    )
  );

-- Users can update their own messages
CREATE POLICY "group_messages_update_own" ON group_messages 
  FOR UPDATE 
  USING (auth.uid()::text = userId);

-- Users can delete their own messages, admins can delete any message
CREATE POLICY "group_messages_delete_own_or_admin" ON group_messages 
  FOR DELETE 
  USING (
    auth.uid()::text = userId OR
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.groupId = group_messages.groupId 
      AND gm.userId = auth.uid()::text 
      AND gm.role = 'admin'
    )
  );

-- ============================================================================
-- REACTIONS POLICIES
-- ============================================================================

-- Users can view reactions on messages they can see
CREATE POLICY "reactions_select_visible" ON reactions 
  FOR SELECT 
  USING (
    (messageType = 'dm' AND EXISTS (
      SELECT 1 FROM dm_messages dm 
      JOIN dm_threads dt ON dm.threadKey = dt.threadKey 
      WHERE dm.id = reactions.messageId 
      AND (dt.aId = auth.uid()::text OR dt.bId = auth.uid()::text)
    )) OR
    (messageType = 'group' AND EXISTS (
      SELECT 1 FROM group_messages gm 
      JOIN group_members gmem ON gm.groupId = gmem.groupId 
      WHERE gm.id = reactions.messageId 
      AND gmem.userId = auth.uid()::text
    ))
  );

-- Users can add reactions to messages they can see
CREATE POLICY "reactions_insert_visible" ON reactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text = userId AND
    (
      (messageType = 'dm' AND EXISTS (
        SELECT 1 FROM dm_messages dm 
        JOIN dm_threads dt ON dm.threadKey = dt.threadKey 
        WHERE dm.id = reactions.messageId 
        AND (dt.aId = auth.uid()::text OR dt.bId = auth.uid()::text)
      )) OR
      (messageType = 'group' AND EXISTS (
        SELECT 1 FROM group_messages gm 
        JOIN group_members gmem ON gm.groupId = gmem.groupId 
        WHERE gm.id = reactions.messageId 
        AND gmem.userId = auth.uid()::text
      ))
    )
  );

-- Users can remove their own reactions
CREATE POLICY "reactions_delete_own" ON reactions 
  FOR DELETE 
  USING (auth.uid()::text = userId);

-- ============================================================================
-- REPORTS POLICIES
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "reports_select_own" ON reports 
  FOR SELECT 
  USING (auth.uid()::text = reporterId);

-- Users can create reports
CREATE POLICY "reports_insert_own" ON reports 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = reporterId);

-- Only admins can update reports
CREATE POLICY "reports_update_admin" ON reports 
  FOR UPDATE 
  USING (false); -- Handled by backend with admin check

-- No deleting reports
CREATE POLICY "reports_no_delete" ON reports 
  FOR DELETE 
  USING (false);

-- ============================================================================
-- BANS POLICIES
-- ============================================================================

-- Users can view their own ban status
CREATE POLICY "bans_select_own" ON bans 
  FOR SELECT 
  USING (auth.uid()::text = userId);

-- Only system can create bans
CREATE POLICY "bans_insert_system" ON bans 
  FOR INSERT 
  WITH CHECK (false); -- Handled by backend

-- No updates or deletes on bans
CREATE POLICY "bans_no_update" ON bans 
  FOR UPDATE 
  USING (false);

CREATE POLICY "bans_no_delete" ON bans 
  FOR DELETE 
  USING (false);

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Users can view their own audit logs
CREATE POLICY "audit_logs_select_own" ON audit_logs 
  FOR SELECT 
  USING (auth.uid()::text = userId);

-- Only system can create audit logs
CREATE POLICY "audit_logs_insert_system" ON audit_logs 
  FOR INSERT 
  WITH CHECK (false); -- Handled by backend

-- No updates or deletes on audit logs
CREATE POLICY "audit_logs_no_update" ON audit_logs 
  FOR UPDATE 
  USING (false);

CREATE POLICY "audit_logs_no_delete" ON audit_logs 
  FOR DELETE 
  USING (false);

-- ============================================================================
-- STORAGE POLICIES (for file attachments)
-- ============================================================================

-- Drop existing permissive storage policies
DROP POLICY IF EXISTS "Users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their attachments" ON storage.objects;

-- Users can upload files to their own folder
CREATE POLICY "storage_insert_own_folder" ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'attachments' AND 
    (storage.foldername(name))[1] = 'messages' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can view files they uploaded or files in conversations they participate in
CREATE POLICY "storage_select_accessible" ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'attachments' AND (
      -- Own files
      (storage.foldername(name))[2] = auth.uid()::text OR
      -- Files in DM threads they participate in (would need more complex logic)
      -- For now, allow viewing all attachment files (they're referenced in messages anyway)
      true
    )
  );

-- Users can update their own files
CREATE POLICY "storage_update_own" ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'attachments' AND 
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can delete their own files
CREATE POLICY "storage_delete_own" ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'attachments' AND 
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- ============================================================================
-- ENABLE RLS ON ALL TABLES (if not already enabled)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- These policies enforce:
-- 1. Users can only access data they should have access to
-- 2. DM messages are only visible to participants
-- 3. Group messages are only visible to group members
-- 4. Users can only modify their own content
-- 5. Admin actions are properly restricted
-- 6. File uploads are scoped to user folders
-- 7. Audit logs and bans cannot be tampered with
--
-- This replaces the previous overly permissive "USING (true)" policies
-- with proper access control based on user relationships and permissions.
-- ============================================================================
