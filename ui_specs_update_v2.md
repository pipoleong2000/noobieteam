# Noobieteam UI/UX Architecture Updates (Extension)

## 10. Vault: Reveal Secret Flow & Error Handling

### 10.1 Forced Master PIN Creation (Google OAuth)
- **UX Goal:** Prevent the "Vault sync failed: Encryption failed" error from ever happening by proactively ensuring all users have a decryption key.
- **Trigger Location:** The Workspace Hub (Home Page).
- **Logic:** 
  1. Immediately upon a user logging in and landing on the Workspace Hub, the frontend must check their profile state (`hasPassword` or `hasVaultPin`).
  2. If the user authenticated via Google OAuth AND does not have a Master Vault PIN set, a **blocking, glassmorphism modal** must pop up automatically.
- **Modal UI Specs:**
  - **Title:** "Create Master Vault PIN"
  - **Description:** "To securely encrypt and access your Vault credentials, you must create a Master PIN. This PIN replaces a standard password."
  - **Inputs:** `PIN` and `Confirm PIN` (minimum 6 characters).
  - **Constraint:** The user CANNOT dismiss this modal (no close button, clicking the backdrop does nothing). They must set a PIN to continue using the application.

## 16. AI Assistant Icon CSS Correction
- **Issue:** The SVG icon inside the NoobieHelper floating button is misaligned (run off from the circle).
- **CSS Fix Directive:** The wrapper `<button>` or `<div>` for the AI Assistant floating icon must utilize precise Flexbox centering classes to align the inner SVG:
  - `display: flex` (`flex`)
  - `align-items: center` (`items-center`)
  - `justify-content: center` (`justify-center`)
  - If the SVG has padding or margin inherited, it must be stripped (`p-0`, `m-0`).
  - Ensure the parent container has equal height and width (e.g., `w-14 h-14` or `w-16 h-16`) and `rounded-full` to maintain the perfect circular shape around the centered icon.

## 17. Expired Cards Intervention (Workspace Entry Flow)
- **UX Concept:** Proactive workspace management. When a user opens a workspace, they should immediately be notified of severely overdue tasks.
- **Trigger Condition:** 
  - Triggers **once per session** upon entering a specific Workspace View.
  - The frontend must evaluate all cards in the board. If any card has a `dueDate` that is `< (Current Date - 3 days)`, the modal triggers.
- **Modal UI Layout:**
  - **Style:** A centered, high-attention glassmorphism modal (`backdrop-blur-lg`, slightly tinted red border `border-red-500/30` to denote urgency).
  - **Header:** "Warning: Severely Expired Tasks" (with a warning icon).
  - **Content Body:** A scrollable list container (max height `max-h-64`) displaying the titles and exact due dates of the expired cards.
  - **Action Footer (The 3 Options):**
    1. **Archive All:** A solid red button (`bg-red-500 hover:bg-red-600 text-white`). Clicking this instantly sets all listed cards to `status: "Archived"` and closes the modal.
    2. **Move All To:** A split component consisting of a dropdown `select` element (listing all active column names) and a "Move" button. Clicking "Move" updates the `columnId` of all listed cards to the selected destination and closes the modal.
    3. **Do Nothing (Dismiss):** A subtle, ghost/text button (`text-gray-500 hover:bg-gray-100`). Clicking this simply closes the modal without altering the cards.
