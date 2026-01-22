# GFilter™ (v1.1.2) - Setup Guide

> [!IMPORTANT]
> **MANDATORY NOTICE**: This copyright and all attribution headers must remain intact to use this code. 

GFilter is now ready! This tool allows you to create Gmail filters and retention policies directly from your phone by simply adding labels.

## 🚀 One-Minute Setup

To get GFilter running in your own Google account:

1.  **Create a New Google Sheet**: Go to [sheets.new](https://sheets.new).
2.  **Open Apps Script**: Click on **Extensions** > **Apps Script**.
3.  **Copy the Code**:
    *   Copy everything from [Code.gs](./Code.gs) into the `Code.gs` file in the editor.
    *   (Optional but recommended) Click the gear icon (Project Settings), check "Show 'appsscript.json' manifest file", and replace its content with [appsscript.json](./appsscript.json).
4.  **Save and Refresh**: Save the project (Ctrl+S) and refresh your Google Sheet.
5.  **Initialize**:
    *   A new menu **GFilter** will appear in the toolbar.
    *   Click **GFilter** > **Initialize / Refresh Labels**.
    *   *Note: You will be asked for permissions. Since this is your own script, click "Advanced" and "Go to GFilter (unsafe)" to authorize yourself.*

---

## 🛠 How to Use GFilter

### 1. Creating a New Rule (Mobile or Desktop)
1.  Open an email you want to filter.
2.  Add **ONE Scope label**:
    *   `__auto/{Sender}`, `__auto/{Domain}`, `__auto/{List}`, or `__auto/{Subject}`.
5.  Add **ONE or MORE Action labels**:
    *   `__auto/Archive`, `__auto/Delete`, `__auto/Spam`, `__auto/Star`.
    *   `__auto/Inbox`: Use this if you want the email to stay in your Inbox.
    *   `__auto/CopyLabels`: **Special Action**. Use this to copy your personal labels (like "Work" or "GVoice") to future emails.
6.  *(Optional)* Add any regular labels (e.g., "GVoice") if you want them copied.
7.  GFilter will find this email, save the rule to your GSheet, and handle all future emails.

### 2. Setting a Retention Policy
Don't want to keep OTPs for more than a day?
1.  Add the label `__auto/Keep1d` to the email.
2.  Every night at 2 AM, GFilter will delete any email with that label that is older than 24 hours.
3.  Available options: `1d`, `7d`, `1m`, `3m`, `6m`, `1y`, `3y`, `7y`.

### 3. Automating
1.  Go to **GFilter** > **Set Automation Triggers**.
2.  Follow the prompt to choose how often GFilter should run (**10**, **30**, or **60** minutes).
3.  GFilter will now handle everything automatically in the background—no more manual syncing required!
4.  **Need to pause?** Use **GFilter** > **Stop All Automation** to instantly kill all background tasks.

---

## 📊 The GSheet "Brain"
GFilter stores all its intelligence in two tabs at the bottom of your spreadsheet:

*   **Rules Tab**: This is your "Command Center". You can view, edit, or delete any active filter here.
*   **Logs Tab**: A rolling history of every action GFilter has taken.

> [!NOTE]
> These tabs are created automatically the first time you click **Initialize** or **Sync**. 

---

## 🕰 Feature: Background Backlog Sync (New!)
Got 20,000 emails to clean? GFilter™ (v1.0.6) is designed for "Mass Cleanup" without hitting Google's limits.

When you create a new rule, GFilter starts a **Background Backlog Sync**:
*   **Safe Batches**: It processes **100 emails at a time** every time the automation runs (e.g., every 10 or 30 mins).
*   **Tracking**: Look at the **Sync History** and **Processed Count** columns in your **Rules** sheet to watch it work in real-time.
*   **Automatic**: It will automatically stop once it reaches the end of your Gmail history for that sender or domain.
*   **Reliable**: This "slow and steady" approach ensures that even 50,000 emails can be cleared safely over a few days without you lifting a finger.

---

## 🔒 Security & Privacy FAQ

### Do I need to change any Google Cloud settings?
**No.** Because you are running this script within your own Google workspace/account, you do not need to create a GCP project, set up OAuth screens, or configure any "fancy" cloud settings.  
*The only thing you will see is a one-time "App not verified" warning when you first run the script. This is normal because you are the developer of your own copy. Simply click **Advanced** -> **Go to GFilter**.*

### Who owns GFilter?
GFilter is a proprietary tool developed by **123 PROPERTY INVESTMENT GROUP, INC.**

### Support & Contact
If you have questions or need assistance, please contact:
**Email**: [Hello@RapidCashHomeBuyers.org](mailto:Hello@RapidCashHomeBuyers.org)  
**Organization**: 123 PROPERTY INVESTMENT GROUP, INC.

---

> [!TIP]
> **Privacy First**: Because you copied this script into your own account, no one but you has access to your emails. Your data stays in your personal Google Drive.

---

## ⚖️ Legal Disclaimer & Anti-Piracy Notice

**GFilter™** is the exclusive property of **123 PROPERTY INVESTMENT GROUP, INC.**

### Usage Restrictions
*   This code is provided for individual, private use only.
*   **Redistribution Prohibited**: You may not share, upload, or distribute this source code to any public or private repositories, forums, or marketplaces.
*   **Commercial Use Prohibited**: You may not sell, license, or charge fees for the use of GFilter™ or any derivative works.
*   **Integration Prohibited**: You may not incorporate this code into any third-party apps, software suites, or SaaS platforms.

### Enforcement
**123 PROPERTY INVESTMENT GROUP, INC.** actively monitors the internet and software repositories for unauthorized use or distribution of its intellectual property. We reserve the right to seek:
1.  **Injunctive Relief**: Immediate take-down of any platform hosting our code.
2.  **Monetary Damages**: Pursuit of all lost profits and statutory damages.
3.  **Legal Fees**: Violators will be held liable for all legal costs incurred during enforcement.

---

> [!TIP]
> **Privacy First**: Because you copied this script into your own account, no one but you has access to your emails. Your data stays in your personal Google Drive.

© 2026 123 PROPERTY INVESTMENT GROUP, INC. All Rights Reserved. GFilter™ is a trademark of 123 PROPERTY INVESTMENT GROUP, INC.

**Official Repository**: [https://github.com/BlueDragon-Safex/GFilter](https://github.com/BlueDragon-Safex/GFilter)
