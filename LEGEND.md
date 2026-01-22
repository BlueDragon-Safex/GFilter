# GFilter™ Action Legend

This document defines exactly what happens when you use specific actions in your GFilter Rules sheet or apply `__auto/` labels in Gmail.

---

## 1. Core System Actions
These are the standard, non-retention actions built into the system.

| Action | Result in Gmail |
| :--- | :--- |
| **Archive** | Moves the email out of the Inbox. (Standard Gmail Archive). |
| **Delete** | Moves the email directly to the **Trash**. |
| **Spam** | Moves the email to the **Spam** folder. |
| **Star** | Adds a **Star** to the thread. (Stays in Inbox). |
| **Important** | Marks the thread as **Important**. (Stays in Inbox). |
| **Inbox** | No action taken. The email remains exactly where it is. |

---

## 2. Dynamic Retention Engine (`KeepNX`)
Any action starting with **Keep** followed by a time period (e.g., `Keep7d`, `Keep30m`, `Keep1y`).

| Action Prefix | Behavior | Cleanup (Daily at 2 AM) |
| :--- | :--- | :--- |
| **Keep[#]d** | Tags with `__auto/Keep[#]d` and Archives. | **Trashes** email after [#] Days. |
| **Keep[#]m** | Tags with `__auto/Keep[#]m` and Archives. | **Trashes** email after [#] Months. |
| **Keep[#]y** | Tags with `__auto/Keep[#]y` and Archives. | **Trashes** email after [#] Years. |

> [!TIP]
> **Example**: `Keep30d` will ensure the email is labeled and archived immediately, then automatically deleted exactly 30 days after it was received.

---

## 3. Custom Action Labels
If you enter any custom text not listed above (e.g., `Work`, `Taxes`, `Receipts`).

- **Result**: GFilter automatically creates a label named `__auto/[YourText]`.
- **Action**: The email is tagged with that label and **Archived** immediately.
- **Purpose**: Use this for high-speed categorization of mail that you want to keep but don't want cluttering your Inbox.

---

## 4. Special Modifiers
These are advanced "utility" actions.

- **`CopyLabels`**: 
    - **When Tagging in Gmail**: If you tag an email with `__auto/CopyLabels` along with a scope (like `__auto/{Sender}`), GFilter will detect all *other* labels you've manually applied (e.g., "Personal") and copy them into your spreadsheet rules automatically.
    - **In Spreadsheet**: If listed as an action, it simply ensures the email stays in the Inbox while other rules are processed.

---

## ⚠️ Summary of Logic
1. **Match** ➡️ 2. **Execute Action** (Delete/Star/etc) ➡️ 3. **Archive** (unless action is Star/Important/Inbox).

*GFilter™ - Total Inbox Zero with Zero effort.*
