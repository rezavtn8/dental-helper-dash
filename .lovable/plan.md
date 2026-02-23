

# Dashboard Simplification & UX Overhaul

## The Problem

The app has too many sidebar tabs across all three roles, making it feel scattered and overwhelming. Many tabs overlap in content or show barely-used features.

**Current tab counts:**
- Owner: 11 sidebar items
- Assistant: 8 sidebar items
- Front Desk: 8 sidebar items (some with no actual content like Phone Calls, Messages)

## The Solution

Consolidate tabs by merging related features together, removing low-value standalone tabs, and creating a cleaner navigation structure.

---

## Owner Dashboard: 11 tabs → 6 tabs

| Before | After | What happens |
|--------|-------|-------------|
| Dashboard | **Dashboard** | Merge Analytics charts directly into Dashboard. Remove the separate Analytics tab. |
| Tasks | **Tasks** | Keep as-is (already has list + calendar toggle) |
| Templates | *(merged into Tasks)* | Add a "Templates" button/section within the Tasks tab instead of a separate nav item |
| Learning Courses | **Courses** | Keep (distinct enough) |
| Team | **Team** | Merge Schedule + Feedback into Team. Team tab gets sub-sections: Members, Schedule, Feedback |
| Team Schedule | *(merged into Team)* | Becomes a sub-view within Team |
| Logs | *(merged into Settings)* | Move activity log into Settings as a sub-tab |
| Feedback | *(merged into Team)* | Feedback is about team members, belongs in Team |
| Analytics | *(merged into Dashboard)* | Key charts move into Dashboard |
| AI Assistant | **AI Assistant** | Keep |
| Settings | **Settings** | Add Logs as a sub-tab here |

**New Owner sidebar (6 items):**
1. Dashboard (with analytics)
2. Tasks (with templates access)
3. Team (members + schedule + feedback)
4. Courses
5. AI Assistant
6. Settings (with logs)

## Assistant Dashboard: 8 tabs → 5 tabs

| Before | After | What happens |
|--------|-------|-------------|
| Home | **Home** | Keep as-is |
| My Tasks | **Tasks** | Keep as-is |
| Schedule | **Schedule** | Keep as-is |
| My Stats | *(merged into Home)* | Move key stats cards into the Home tab |
| Learning | **Learning** | Merge Certifications into Learning as a sub-section |
| Certifications | *(merged into Learning)* | Becomes a section within Learning |
| Feedback | *(merged into Home)* | Show recent feedback on Home tab |
| Settings | **Settings** | Keep as-is |

**New Assistant sidebar (5 items):**
1. Home (with stats + recent feedback)
2. Tasks
3. Schedule
4. Learning (with certifications)
5. Settings

## Front Desk Dashboard: 8 tabs → 4 tabs

| Before | After | What happens |
|--------|-------|-------------|
| Home | **Home** | Keep |
| My Tasks | **Tasks** | Keep |
| Schedule | *(merged into Home)* | Show schedule summary on Home |
| My Stats | *(merged into Home)* | Show key stats on Home |
| Learning | **Learning** | Keep |
| Phone Calls | *(removed)* | No actual content exists for this tab |
| Messages | *(removed)* | No actual content exists for this tab |
| Settings | **Settings** | Keep |

**New Front Desk sidebar (4 items):**
1. Home (with schedule + stats)
2. Tasks
3. Learning
4. Settings

---

## Technical Details

### Files to Modify

**Owner Dashboard:**
- `src/components/owner/OwnerSidebar.tsx` -- Reduce navigation items from 11 to 6
- `src/components/owner/OwnerDashboardTabs.tsx` -- Remove deleted tab contents, update remaining
- `src/components/owner/OwnerDashboardTab.tsx` -- Merge analytics charts (from OwnerAnalyticsTab) into this component
- `src/components/owner/OwnerTeamTab.tsx` -- Add sub-tabs for Members, Schedule, Feedback (embed OwnerScheduleTab and OwnerFeedbackTab content)
- `src/components/owner/OwnerTasksTab.tsx` -- Add a "Templates" button that opens templates inline or as a dialog
- `src/components/owner/OwnerSettingsTab.tsx` -- Add a "Logs" sub-tab embedding OwnerLogTab content

**Assistant Dashboard:**
- `src/components/assistant/NewAssistantSidebar.tsx` -- Reduce from 8 to 5 items
- `src/components/assistant/AssistantDashboardTabs.tsx` -- Remove deleted tab contents
- `src/components/assistant/AssistantHomeTab.tsx` -- Add stats summary cards and recent feedback section
- `src/components/assistant/AssistantLearningTab.tsx` -- Merge certifications section into learning (or use LearningHub with certs section)

**Front Desk Dashboard:**
- `src/components/front-desk/NewFrontDeskSidebar.tsx` -- Reduce from 8 to 4 items (remove calls, messages, schedule, stats)
- `src/components/front-desk/FrontDeskDashboardTabs.tsx` -- Update to match new tab structure
- `src/pages/FrontDeskDashboard.tsx` -- Clean up learning tab special-case logic

### Files to Delete (content merged elsewhere)
- `src/components/owner/OwnerAnalyticsTab.tsx` -- merged into Dashboard
- `src/components/owner/OwnerLogTab.tsx` -- merged into Settings
- `src/components/owner/OwnerFeedbackTab.tsx` -- merged into Team
- `src/components/owner/OwnerScheduleTab.tsx` -- merged into Team
- `src/components/owner/OwnerTemplatesTab.tsx` -- templates accessed from Tasks tab
- `src/components/assistant/AssistantStatsTab.tsx` -- merged into Home
- `src/components/assistant/AssistantFeedbackTab.tsx` -- merged into Home
- `src/components/assistant/AssistantCertificationsTab.tsx` -- merged into Learning

### Files to Keep As-Is
- `src/components/owner/AIAssistantTab.tsx`
- `src/components/owner/CourseManagementTab.tsx`
- `src/components/assistant/AssistantTasksTab.tsx`
- `src/components/assistant/AssistantScheduleTab.tsx`
- `src/components/assistant/AssistantSettingsTab.tsx`
- `src/components/front-desk/FrontDeskHomeTab.tsx`
- `src/components/front-desk/FrontDeskTasksTab.tsx`
- `src/components/learning/LearningHub.tsx`

### Implementation Order
1. Owner sidebar + tabs consolidation (biggest impact)
2. Assistant sidebar + tabs consolidation
3. Front Desk sidebar + tabs consolidation
4. Delete orphaned files
5. Test all navigation flows

