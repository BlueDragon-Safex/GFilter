# GFilter Implementation Plan

GFilter is a Gmail automation tool that uses a Google Sheet and Apps Script to manage email filters via label application. This plan focuses on creating a "Self-Hosted" version to ensure maximum privacy and user trust.

## User Review Required

> [!IMPORTANT]
> **Security & Permissions**: Any script that interacts with Gmail will trigger a Google authorization warning ("This app isn't verified" or "This script wants to access your emails"). 
> 
> To minimize alarm:
> 1. We will use **Script Templates**. Users make their own copy of the sheet, so the script runs as *them*, inside *their* account.
> 2. We will use **Explicit Scopes** in the `appsscript.json` to avoid asking for more permissions than necessary (e.g., only `gmail.modify` and `gmail.labels` instead of full mail access).

## Proposed Changes

### [Google Apps Script]

Summary: The script will handle label creation, rule detection, and periodic email cleanup.

#### [NEW] [Code.gs](./Code.gs)
- `onOpen()`: Adds a custom "GFilter" menu to the spreadsheet.
- `setupLabels()`: Creates the `__auto/` hierarchy (Actions and Scopes).
- `processAutoLabels()`: The main engine that finds emails labeled with `__auto` and creates rules in the GSheet.
- `applyRules()`: Triggered periodically to handle new incoming mail based on stored rules.
- `cleanUpRetention()`: Janitor logic for `KeepNx` labels.

#### [NEW] [appsscript.json](./appsscript.json)
- Explicitly define scopes for Gmail and Google Sheets to limit exposure.

### [Google Sheet]

Summary: The frontend for managing rules and viewing logs.

#### [NEW] Rules Tab
- Columns: `RuleID`, `Type` (Sender/Domain/etc), `Value`, `Action`, `Active`, `CreatedDate`.

#### [NEW] Logs Tab
- Columns: `Timestamp`, `ActionTaken`, `Subject`, `MatchValue`.

## Verification Plan

### Automated Tests
- Test label creation script.
- Test rule extraction (applying labels to a test email and verifying GSheet entry).
- Test retention logic with dummy dates.

### Manual Verification
1. Create a "Template" copy link.
2. Verify the permission flow.
3. Apply a `{Sender}` + `Delete` label and check if subsequent emails from the same sender are handled.
