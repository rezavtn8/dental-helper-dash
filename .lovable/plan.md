

# Fix Holiday Dates & Join Request History

## Issue 1: Outdated Holiday Dates

The `initialize_federal_holidays` database function only contains 2024-2025 holidays. Since the current date is February 2026, all dates are in the past and outdated.

**Fix:** Create a new migration that replaces the function with updated 2026-2027 federal holidays (correct dates for Thanksgiving, MLK Day, Presidents Day, Memorial Day, Labor Day, Columbus Day).

2026 Federal Holidays:
- New Year's Day: Jan 1
- MLK Day: Jan 19
- Presidents Day: Feb 16
- Memorial Day: May 25
- Juneteenth: Jun 19 (was missing entirely)
- Independence Day: Jul 4 (observed Jul 3, Friday)
- Labor Day: Sep 7
- Columbus Day: Oct 12
- Veterans Day: Nov 11
- Thanksgiving: Nov 26
- Christmas: Dec 25

2027 Federal Holidays:
- New Year's Day: Jan 1
- MLK Day: Jan 18
- Presidents Day: Feb 15
- Memorial Day: May 31
- Juneteenth: Jun 19 (Saturday, observed Jun 18)
- Independence Day: Jul 4 (Sunday, observed Jul 5)
- Labor Day: Sep 6
- Columbus Day: Oct 11
- Veterans Day: Nov 11
- Thanksgiving: Nov 25
- Christmas: Dec 25 (Saturday, observed Dec 24)

## Issue 2: Join Request History Fails to Load

The error is: `Could not find a relationship between 'join_requests' and 'user_id' in the schema cache`

**Root cause:** `JoinRequestHistory.tsx` uses a Supabase join query syntax (`users:user_id (id, name, email)`) which requires a foreign key from `join_requests.user_id` to `users.id`. No such FK exists.

**Fix:** Change `JoinRequestHistory.tsx` to use separate queries (fetch join requests, then fetch user data) -- the same pattern `OwnerTeamTab.tsx` already uses successfully.

## Issue 3: Dead Code - PendingRequestsTab

`PendingRequestsTab.tsx` is not imported anywhere. It duplicates functionality already in `OwnerTeamTab.tsx`. Delete it.

---

## Technical Details

### Database Migration
- Replace `initialize_federal_holidays` function with 2026-2027 dates
- Add Juneteenth (missing from original)

### Files to Modify
- `src/components/owner/JoinRequestHistory.tsx` -- Replace the join query with separate queries (same pattern as OwnerTeamTab)

### Files to Delete
- `src/components/owner/PendingRequestsTab.tsx` -- Dead code, never imported

