# GFilter™ Action Legend

Learn how to build powerful automation rules for your Gmail.

---

## 🏗️ How to Build a Rule
Every rule consists of a **Scope** (Who) and one or more **Actions** (What).

1.  **Scope**: Choose exactly **one** from: `{Sender}`, `{Domain}`, `{List}`, or `{Subject}`.
2.  **Actions**: Choose one or more from the categories below. 
    > [!TIP]
    > **Combine Actions**: You can combine multiple actions in one rule using the `+` sign (e.g., `Star+Keep7d`).

---

## 🛠️ Action Categories

### 2a. Retention (Keep email for a period)
Use these to set a "self-destruct" timer on emails.
- **`Keep7d`**: Purge after 7 Days.
- **`Keep30m`**: Purge after 30 Months.
- **`Keep1y`**: Purge after 1 Year.

### 2b. General Actions
- **`Star`**: Adds a Star.
- **`Important`**: Marks as Important.

### 2c. Fast Cleanup
- **`Delete`**: Direct to Trash.
- **`Archive`**: Move out of Inbox.
- **`Spam`**: Move to Spam folder.

### 2d. Organization
- **`Bulk` / `Newsletter` / `Work`**: Creates a custom label and archives.
- **`CopyLabels`**: Modifier to sync existing labels from Gmail to GSheet.

---

## 🚀 Examples

| Scope + Action | Result |
| :--- | :--- |
| **`{Sender}`** + `Star+Keep1m` | Stars the email and Trashes it after 1 month. |
| **`{Domain}`** + `Spam` | Sends everything from that domain to Spam. |
| **`{Subject}`** + `Bulk+Keep3m` | Labels as "Bulk", Archives, and Trashes after 3 months. |
| **`{Sender}`** + `Receipt+Expense+Keep3y+CopyLabels` | Labels as "Receipt", "Expense", Archives, and Trashes after 3 years. Copies any other existing labels. |

---

*GFilter™ - Total Inbox Zero with Zero effort.*
