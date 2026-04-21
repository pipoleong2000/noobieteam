# Noobieteam UI/UX Architecture Updates (Backlog Feature)

## 18. Backlog Module (Jira Style)
- **UX Concept:** A high-density, vertical list view designed for rapid task prioritization and seamless transition into the active Kanban board (Sprint/To Do).
- **Location & Integration:** 
  - Implement as a **Side Drawer** (collapsible right/left panel) OR a **Dual-Pane View** within the main Workspace page. 
  - **Crucial Rule:** The Backlog must be visible *simultaneously* with the active Kanban board to allow for direct drag-and-drop.
- **Trigger Element:** A distinct 'Backlog' toggle button or icon (e.g., `lucide-list` or `lucide-layers`) located in the workspace header or sidebar.
- **Backlog List UI (High Density):**
  - **Format:** Rows, not cards.
  - **Data Points per Row:** Minimalist display showing only: Task Title, Assignee Avatar (small), Priority Icon/Color, and Due Date (optional).
  - **Styling:** Thin dividers between rows (`border-b border-gray-200`), compact padding (`py-1 px-2`), and subtle hover states (`hover:bg-gray-50`) to maintain the "Instagram-style light minimalist" theme.
- **Interaction Mechanics:**
  - **Global Ranking:** Users can drag-and-drop rows vertically within the Backlog list to reorder their priority.
  - **Board Transition (The Core Flow):** 
    - A user clicks and drags a row from the Backlog.
    - A 'ghost' placeholder follows the cursor.
    - The target column on the active Kanban board (e.g., 'To Do') highlights to indicate a valid drop zone.
    - Dropping the row instantly converts it into a full Kanban card in that column and updates the backend status.
  - **Quick Add:** A permanent "+ Create issue" inline input field at the bottom or top of the Backlog list (similar to the Trello-style inline addition on the board) for rapid brainstorming.