

# Task Management Overhaul

## Problems Identified

1. **Duplicate/Dead Components**: Several task components exist that are never imported or used:
   - `TasksTab.tsx` (old version, 527 lines - not imported anywhere)
   - `OwnerTasks.tsx` (311 lines - not imported anywhere)
   - `BulkImportTasksDialog.tsx` (not imported anywhere)
   - `InsightsTab.tsx` (not imported anywhere)

2. **Redundant Functionality**: The owner has 3 separate places to manage tasks:
   - "Task Calendar" tab (calendar view with daily/weekly/monthly)
   - "Tasks" tab (table view with search/filters/bulk actions)
   - Dashboard tab also shows task summaries
   
   The Task Calendar and Tasks tab both independently fetch the same data, have their own filter systems, and own Create/Edit/Delete dialogs.

3. **Overly Complex Recurring Task Logic**: `taskUtils.ts` is 1,094 lines with complex recurring instance generation (EOW, MidM, EOM patterns) that generates virtual task instances client-side - adding complexity and console log noise.

4. **Too Many Task-Related Dialogs**: There are 5 separate dialogs for task operations:
   - `CreateTaskDialog` - create tasks
   - `EditTaskDialog` - edit tasks  
   - `ReassignTaskDialog` - reassign (could be in edit)
   - `DeleteTaskDialog` - delete confirmation
   - `TaskDetailModal` - view/edit task details (duplicates EditTaskDialog functionality)

5. **Inconsistent Status Values**: `OwnerTasks.tsx` uses "To Do" / "In Progress" / "Done" while the database uses "pending" / "in-progress" / "completed".

6. **Excessive Console Logging**: The assistant task tab has ~20+ console.log statements for debugging task categorization.

## Plan

### Phase 1: Remove Dead Code
- Delete `src/components/owner/TasksTab.tsx` (unused, 527 lines)
- Delete `src/components/owner/OwnerTasks.tsx` (unused, 311 lines)
- Delete `src/components/owner/BulkImportTasksDialog.tsx` (unused)
- Delete `src/components/owner/InsightsTab.tsx` (unused)

### Phase 2: Consolidate Task Dialogs
- Merge `ReassignTaskDialog` functionality into `EditTaskDialog` (reassign is just changing the assigned_to field, which EditTaskDialog already has)
- Remove `TaskDetailModal` - merge its view-mode display into `EditTaskDialog` (it already shows the same fields)
- Keep `DeleteTaskDialog` (it's small and focused)
- Keep `CreateTaskDialog` (it's well-structured)
- Update `EditTaskDialog` to show a cleaner view/edit mode with task timeline info

### Phase 3: Merge Task Calendar + Tasks into One Tab
- Combine the "Task Calendar" and "Tasks" tabs into a single unified "Tasks" tab
- Add a toggle between "List View" and "Calendar View" within the same tab
- Single data fetch, shared filters, one set of dialogs
- Remove `OwnerTaskCalendarTab.tsx` as a separate component
- Update `OwnerTasksTab.tsx` to include both views
- Update sidebar: remove "Task Calendar" nav item, keep "Tasks"
- Update `OwnerDashboardTabs.tsx` to remove the task-calendar tab content

### Phase 4: Clean Up Task Utilities
- Remove excessive console.log statements from `AssistantTasksTab.tsx` categorization logic
- Remove debug logging from `taskUtils.ts` recurring generation
- Keep the recurring logic functional but quieter

### Phase 5: Simplify Create Task Form
- Remove the "Recurrence" field from `CreateTaskDialog` (recurrence is better handled via templates)
- Remove the checklist builder from `CreateTaskDialog` (rarely used, adds clutter - checklists come from templates)
- Keep: title, description, target role, priority, due time, category, assign to

## Technical Details

### Files to Delete
- `src/components/owner/TasksTab.tsx`
- `src/components/owner/OwnerTasks.tsx`
- `src/components/owner/BulkImportTasksDialog.tsx`
- `src/components/owner/InsightsTab.tsx`
- `src/components/owner/ReassignTaskDialog.tsx`
- `src/components/owner/TaskDetailModal.tsx`

### Files to Modify
- `src/components/owner/OwnerTasksTab.tsx` - Add calendar/list view toggle, integrate TaskCalendar
- `src/components/owner/EditTaskDialog.tsx` - Add view mode with timeline info, remove need for TaskDetailModal
- `src/components/owner/OwnerDashboardTabs.tsx` - Remove task-calendar tab
- `src/components/owner/OwnerSidebar.tsx` - Remove "Task Calendar" nav item
- `src/components/owner/CreateTaskDialog.tsx` - Remove recurrence and checklist sections
- `src/components/assistant/AssistantTasksTab.tsx` - Remove console.log statements
- `src/lib/taskUtils.ts` - Remove debug console.log statements

### Files to Keep As-Is
- `src/components/owner/DeleteTaskDialog.tsx` - Clean and focused
- `src/components/owner/TaskNotesView.tsx` - Only used in TasksTab.tsx (dead code), will be removed
- `src/components/owner/TaskBlock.tsx` - Used by TaskCalendar
- `src/components/owner/TaskCalendar.tsx` - Will be embedded in unified Tasks tab
- `src/components/front-desk/FrontDeskTasksTab.tsx` - Separate role, keep as-is
- `src/components/assistant/AssistantTasksTab.tsx` - Separate role, just clean logs

### Navigation Change
The owner sidebar goes from 12 items to 11 (removing "Task Calendar" as separate entry). Tasks tab becomes the single place for all task management with a view toggle.

