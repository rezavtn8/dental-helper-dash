

# Fix: Pending Join Requests Show "Unknown User"

## Problem
When an owner views pending join requests, user names and emails show as "Unknown User" / "Unknown". This is because the RLS policy `"Owners can view users with pending join requests"` was removed in a previous migration cleanup, so the owner cannot query user details for people who haven't joined their clinic yet.

## Root Cause
The `users` table SELECT policies only allow:
- Users viewing their own profile (`auth.uid() = id`)
- Owners viewing team members already in their clinic (`clinic_id = get_current_user_clinic_id()`)

Users with **pending** join requests don't have matching `clinic_id` yet, so their rows are invisible to the owner.

## Fix
Create a database migration to re-add the permissive SELECT policy on the `users` table using the existing `can_owner_view_user()` security definer function:

```sql
CREATE POLICY "Owners can view users with pending join requests"
ON public.users
FOR SELECT
USING (public.can_owner_view_user(id));
```

This function already exists and checks that the target user has a pending join request for a clinic owned by the current authenticated user.

## Technical Details

### Database Migration
- Single SQL statement re-adding the dropped policy
- No code changes needed -- the query logic in `OwnerTeamTab.tsx` already correctly fetches user details in a separate query (lines 124-141), it's just being blocked by RLS

### Files to Modify
- None -- only a database migration is needed

