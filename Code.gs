/**
 * @fileoverview GFilter - The Intelligent Gmail Filter Engine.
 * @version 1.1.1
 * @date 2026-01-21
 * @copyright (c) 2026 123 PROPERTY INVESTMENT GROUP, INC. All Rights Reserved.
 * @license Proprietary
 * @author 123 PROPERTY INVESTMENT GROUP, INC.
 * @contact Hello@RapidCashHomeBuyers.org
 * @source https://github.com/BlueDragon-Safex/GFilter.git
 * 
 * MANDATORY NOTICE: This copyright and all attribution headers must remain 
 * intact to use this code. 
 * 
 * GFilter™ is a trademark of 123 PROPERTY INVESTMENT GROUP, INC.
 * This software automates Gmail organization using GSheet-stored rules 
 * and Label-based triggers while maintaining 100% user privacy.
 * 
 * USAGE RESTRICTION & ANTI-PIRACY NOTICE:
 * This code is provided for personal use only. Redistribution, resale, or 
 * incorporation of this code (in part or in whole) into any other platform, 
 * software, or service is STRICTLY PROHIBITED. 
 * 
 * 123 PROPERTY INVESTMENT GROUP, INC. aggressively monitors for unauthorized 
 * distribution and will pursue all available legal remedies, including 
 * injunctive relief and monetary damages (statutory and actual), along with 
 * all associated legal fees, against any individual or entity found in 
 * violation of these terms.
 * 
 * CHANGE LOG:
 * v1.0.0 (2026-01-21): Initial prototype release.
 * v1.0.1 (2026-01-21): Added robust error handling for label creation and Gmail operations.
 * v1.0.2 (2026-01-21): Added 'Inbox' action and refined {CopyLabels} logic as a modifier.
 * v1.0.3 (2026-01-21): Added interactive trigger frequency selection (10, 30, 60 mins).
 * v1.0.4 (2026-01-21): Added 'Stop Automation' safety feature to the GFilter menu.
 * v1.0.5 (2026-01-21): Implemented 'Historical Sync' to apply new rules to existing mail.
 * v1.0.6 (2026-01-21): Re-engineered Historical Sync into a background backlog engine (handles 20,000+ emails).
 * v1.0.7 (2026-01-21): Moved {CopyLabels} to ACTIONS for easier rule creation.
 * v1.0.8 (2026-01-21): Renamed {CopyLabels} to CopyLabels for naming convention.
 * v1.0.9 (2026-01-21): Hardened getOrCreateSheet to ensure headers are always present.
 * v1.1.0 (2026-01-21): Implicit Labeling - Removed requirement for manual __auto parent tag.
 * v1.1.1 (2026-01-21): Optimized Logging - Most recent logs now appear at the top with a 1000-row limit.
 * v1.1.2 (2026-01-21): Functional Update Checker - Now pulls the latest version from GitHub.
 */

const CONFIG = {
  LABEL_ROOT: '__auto',
  SHEET_RULES: 'Rules',
  SHEET_LOGS: 'Logs',
  SCOPES: ['{Sender}', '{Domain}', '{List}', '{Subject}'],
  ACTIONS: ['Archive', 'Delete', 'Spam', 'Bulk', 'Newsletter', 'Notify', 'Important', 'Star', 'Inbox', 'CopyLabels']
};

const VERSION = 'v1.1.2';

/**
 * Adds a custom menu to the Google Sheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu(`GFilter (${VERSION})`)
    .addItem('Initialize / Refresh Labels', 'setupLabels')
    .addItem('Sync Rules from Labels', 'processAutoLabels')
    .addSeparator()
    .addItem('Run Cleanup (Retention)', 'cleanUpRetention')
    .addItem('Set Automation Triggers', 'setupTrigger')
    .addItem('Stop All Automation', 'stopTrigger')
    .addSeparator()
    .addItem('Check for Updates...', 'checkUpdates')
    .addToUi();
}

function checkUpdates() {
  const ui = SpreadsheetApp.getUi();
  const rawUrl = 'https://raw.githubusercontent.com/BlueDragon-Safex/GFilter/main/Code.gs';
  
  try {
    const response = UrlFetchApp.fetch(rawUrl);
    const content = response.getContentText();
    const remoteVersionMatch = content.match(/const VERSION = '([^']+)'/);
    
    if (!remoteVersionMatch) {
      ui.alert('Update Check', 'Could not determine the latest version from GitHub.', ui.ButtonSet.OK);
      return;
    }
    
    const remoteVersion = remoteVersionMatch[1];
    
    if (remoteVersion === VERSION) {
      ui.alert('Update Check', `Current Version: ${VERSION}\n\nYou are running the latest version of GFilter.`, ui.ButtonSet.OK);
    } else {
      const response = ui.alert(
        'Update Available', 
        `A newer version (${remoteVersion}) is available on GitHub!\n\nYour Version: ${VERSION}\nLatest Version: ${remoteVersion}\n\nWould you like to visit the repository to get the new code?`, 
        ui.ButtonSet.YES_NO
      );
      if (response === ui.Button.YES) {
        const link = 'https://github.com/BlueDragon-Safex/GFilter';
        const html = `<script>window.open("${link}", "_blank");google.script.host.close();</script>Redirecting...`;
        ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(200).setHeight(50), 'Opening GitHub...');
      }
    }
  } catch (e) {
    ui.alert('Update Check', `Failed to check for updates: ${e.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Creates the initial label hierarchy.
 */
function setupLabels() {
  const root = CONFIG.LABEL_ROOT;
  ensureLabel(root);
  
  // Create Scopes
  CONFIG.SCOPES.forEach(s => ensureLabel(`${root}/${s}`));
  
  // Create Actions
  CONFIG.ACTIONS.forEach(a => ensureLabel(`${root}/${a}`));
  
  // Create default retention labels
  ['1d', '7d', '1m', '3m', '6m', '1y', '3y', '7y'].forEach(period => {
    ensureLabel(`${root}/Keep${period}`);
  });
  
  // Ensure GSheet Tabs and Headers exist immediately
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(ss, CONFIG.SHEET_RULES, ['Rule Type', 'Match Value', 'Action', 'Additional Labels', 'Date Created', 'Sync History', 'Processed Count']);
  getOrCreateSheet(ss, CONFIG.SHEET_LOGS, ['Timestamp', 'Message']);
  
  ss.toast('Labels and Sheets initialized!', 'GFilter');
}

function ensureLabel(name) {
  try {
    let label = GmailApp.getUserLabelByName(name);
    if (!label) {
      GmailApp.createLabel(name);
    }
  } catch (e) {
    // If it fails because it already exists (case mismatch or race condition), just log and ignore
    if (e.message.includes('exists') || e.message.includes('Aborted')) {
      console.warn(`Label skipped (likely already exists): ${name}`);
    } else {
      throw e; // Rethrow if it's a different error
    }
  }
}

/**
 * Scans emails labeled with any __auto/ sub-label to create new rules.
 * No longer requires the parent "__auto" label to be manually applied.
 */
function processAutoLabels() {
  const root = CONFIG.LABEL_ROOT;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Find all threads that have ANY label starting with "__auto/"
  // We search for the root and also check sub-labels to be thorough
  const allLabels = GmailApp.getUserLabels();
  const autoSubLabels = allLabels.filter(l => l.getName().startsWith(root + '/'));
  
  const threadMap = new Map();
  
  // Collect all threads from all __auto/ sub-labels
  autoSubLabels.forEach(label => {
    const labelThreads = label.getThreads(0, 50); // Process up to 50 per label
    labelThreads.forEach(t => threadMap.set(t.getId(), t));
  });
  
  // Also check for the root label just in case some users still use it
  const rootLabel = GmailApp.getUserLabelByName(root);
  if (rootLabel) {
    rootLabel.getThreads(0, 50).forEach(t => threadMap.set(t.getId(), t));
  }

  const threads = Array.from(threadMap.values());
  if (threads.length === 0) return;

  const ruleSheet = getOrCreateSheet(ss, CONFIG.SHEET_RULES, ['Rule Type', 'Match Value', 'Action', 'Additional Labels', 'Date Created']);
  
  threads.forEach(thread => {
    const labels = thread.getLabels().map(l => l.getName());
    const autoLabels = labels.filter(l => l.startsWith(CONFIG.LABEL_ROOT + '/'));
    
    if (autoLabels.length < 2) return; // Need at least one scope and one action

    const scopes = autoLabels.filter(l => CONFIG.SCOPES.includes(l.split('/')[1]));
    const allActions = autoLabels.filter(l => CONFIG.ACTIONS.includes(l.split('/')[1]));

    if (allActions.length === 0) {
      const msg = 'Missing Action label (e.g., __auto/Archive or __auto/Inbox). Rule skipped.';
      logAction(`Warning: ${msg}`);
      ss.toast(msg, 'GFilter', 10);
      return;
    }

    const hasCopyLabels = allActions.some(a => a.includes('CopyLabels'));
    // The "real" actions are anything EXCEPT CopyLabels
    let realActions = allActions.filter(a => !a.includes('CopyLabels'));
    
    // If CopyLabels was the ONLY action, default to 'Inbox'
    if (realActions.length === 0) {
      realActions = [CONFIG.LABEL_ROOT + '/Inbox'];
    }

    const message = thread.getMessages()[0];
    
    scopes.forEach(s => {
      const scopeType = s.split('/')[1];
      const matchValue = getMatchValue(message, scopeType);
      
      realActions.forEach(a => {
        const actionType = a.split('/')[1];
        // Only include non-auto labels in the "Additional Labels" list
        const labelsToCopy = hasCopyLabels ? labels.filter(l => !l.startsWith(CONFIG.LABEL_ROOT)) : [];
        addRule(ruleSheet, scopeType, matchValue, actionType, labelsToCopy);
      });
    });

    // Cleanup labels after processing
    autoLabels.forEach(l => {
      try {
        const lbl = GmailApp.getUserLabelByName(l);
        if (lbl) thread.removeLabel(lbl);
      } catch (e) {
        console.warn(`Could not remove label ${l}: ${e.message}`);
      }
    });

    try {
      const rootLbl = GmailApp.getUserLabelByName(CONFIG.LABEL_ROOT);
      if (rootLbl) thread.removeLabel(rootLbl);
    } catch (e) {
      console.warn(`Could not remove root label: ${e.message}`);
    }
  });
}

function getMatchValue(message, scopeType) {
  switch (scopeType) {
    case '{Sender}': return message.getFrom().match(/<([^>]+)>/)?.[1] || message.getFrom();
    case '{Domain}': return message.getFrom().split('@')[1].replace('>', '');
    case '{List}': return message.getRawContent().match(/^List-ID:\s*(.*)/im)?.[1] || 'Unknown';
    case '{Subject}': return message.getSubject().replace(/^Re:\s+/i, '').replace(/^Fwd:\s+/i, '');
    case '{CopyLabels}': return 'N/A';
    default: return '';
  }
}

function addRule(sheet, type, value, action, allLabels) {
  const data = sheet.getDataRange().getValues();
  const exists = data.some(row => row[0] === type && row[1] === value && row[2] === action);
  
  if (!exists) {
    const additional = allLabels.filter(l => !l.startsWith(CONFIG.LABEL_ROOT)).join(', ');
    sheet.appendRow([type, value, action, additional, new Date(), 'Pending', 0]);
    
    // Trigger Initial Historical Run (First 100)
    applyRuleToHistory(sheet, sheet.getLastRow(), type, value, action, additional);
    
    sheet.activate();
    SpreadsheetApp.getActiveSpreadsheet().toast(`Rule Created & Historical Sync Started for ${value}`, 'GFilter');
  }
}

/**
 * Applies a single rule to historical emails (Processes one batch of 100).
 */
function applyRuleToHistory(sheet, rowNum, type, value, action, additionalLabels) {
  const query = getQuery(type, value);
  if (!query) return;

  // Search for threads matching the query
  const threads = GmailApp.search(query, 0, 100); 
  if (threads.length === 0) {
    sheet.getRange(rowNum, 6).setValue('Complete');
    return;
  }

  threads.forEach(thread => {
    try {
      executeAction(thread, action);
      if (additionalLabels) {
        additionalLabels.split(',').forEach(labelName => {
          const l = GmailApp.getUserLabelByName(labelName.trim());
          if (l) thread.addLabel(l);
        });
      }
    } catch (e) {
      console.warn(`Backlog apply failed: ${e.message}`);
    }
  });

  // Update Progress in Sheet
  const currentCount = parseInt(sheet.getRange(rowNum, 7).getValue() || 0);
  sheet.getRange(rowNum, 7).setValue(currentCount + threads.length);
  sheet.getRange(rowNum, 6).setValue('In Progress...');
}

/**
 * Maintenance task: deletes or archives mail based on KeepNx labels.
 */
function cleanUpRetention() {
  const root = CONFIG.LABEL_ROOT;
  const labels = GmailApp.getUserLabels();
  
  labels.forEach(label => {
    const name = label.getName();
    if (name.includes(`${root}/Keep`)) {
      const period = name.split('Keep')[1];
      const days = convertToDays(period);
      if (days === null) return;

      const threads = label.getThreads();
      const now = new Date();
      
      threads.forEach(thread => {
        const lastMsgDate = thread.getLastMessageDate();
        const diff = (now - lastMsgDate) / (1000 * 60 * 60 * 24);
        
        if (diff > days) {
          thread.moveToTrash(); // Or archive based on preference
          logAction(`Retention: Deleted ${thread.getFirstMessageSubject()} (Over ${days} days)`);
        }
      });
    }
  });
}

function convertToDays(period) {
  const value = parseInt(period);
  const unit = period.replace(/[0-9]/g, '');
  if (unit === 'd') return value;
  if (unit === 'm') return value * 30;
  if (unit === 'y') return value * 365;
  return null;
}

/**
 * Ensures a sheet exists and has headers.
 */
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    // If sheet exists but is empty, add headers
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function logAction(msg) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = getOrCreateSheet(ss, CONFIG.SHEET_LOGS, ['Timestamp', 'Message']);
  
  // Insert at the top (after header)
  logSheet.insertRowAfter(1);
  logSheet.getRange(2, 1, 1, 2).setValues([[new Date(), msg]]);
  
  // Keep only the last 1000 rows (Header + 999 Logs)
  if (logSheet.getLastRow() > 1000) {
    logSheet.deleteRow(1001);
  }
}

/**
 * The main automation engine. Scans Inbox for mail matching the GSheet rules.
 */
function applyRules() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ruleSheet = ss.getSheetByName(CONFIG.SHEET_RULES);
  if (!ruleSheet) return;

  const rules = ruleSheet.getDataRange().getValues();
  if (rules.length < 2) return; // Only headers

  // Process rules from row 2 onwards
  for (let i = 1; i < rules.length; i++) {
    const [type, value, action, additionalLabels, dateCreated, syncStatus] = rules[i];
    if (!value || !action) continue;

    // 1. Process New Incoming Mail (Inbox)
    const query = getQuery(type, value);
    if (query) {
      const threads = GmailApp.search(`${query} label:inbox`);
      threads.forEach(thread => {
        try {
          executeAction(thread, action);
          if (additionalLabels) {
            additionalLabels.split(',').forEach(labelName => {
              try {
                const l = GmailApp.getUserLabelByName(labelName.trim());
                if (l) thread.addLabel(l);
              } catch (e) { console.warn(`Label add failed: ${e.message}`); }
            });
          }
          logAction(`Applied Rule ${action} to "${thread.getFirstMessageSubject()}"`);
        } catch (e) {
          console.error(`Rule failed: ${e.message}`);
        }
      });
    }

    // 2. Process Historical Backlog (if needed)
    if (syncStatus === 'Pending' || syncStatus === 'In Progress...') {
      applyRuleToHistory(ruleSheet, i + 1, type, value, action, additionalLabels);
    }
  }
}

function getQuery(type, value) {
  switch (type) {
    case '{Sender}': return `from:${value}`;
    case '{Domain}': return `from:*@${value}`;
    case '{List}': return `list:"${value}"`;
    case '{Subject}': return `subject:"${value}"`;
    default: return '';
  }
}

function executeAction(thread, action) {
  switch (action) {
    case 'Archive': thread.moveToArchive(); break;
    case 'Delete': thread.moveToTrash(); break;
    case 'Spam': thread.moveToSpam(); break;
    case 'Star': thread.addStar(); break;
    case 'Important': thread.markImportant(); break;
    case 'Inbox': 
    case 'CopyLabels': 
      break; // Do nothing, message stays in Inbox
    // For Bulk/Newsletter/etc, we just add the label and archive
    default:
      const l = GmailApp.getUserLabelByName(`${CONFIG.LABEL_ROOT}/${action}`);
      if (l) thread.addLabel(l);
      thread.moveToArchive();
      break;
  }
}

/**
 * Sets up a time-driven trigger to run the automation at a user-defined frequency.
 */
function setupTrigger() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'GFilter Automation Setup',
    'How often should GFilter process your rules?\n\nEnter "10", "30", or "60" (minutes):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const frequency = parseInt(response.getResponseText());
  if (![10, 30, 60].includes(frequency)) {
    ui.alert('Invalid frequency. Please enter exactly 10, 30, or 60.');
    return;
  }

  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Set the main rule engine trigger
  ScriptApp.newTrigger('applyRules')
    .timeBased()
    .everyMinutes(frequency)
    .create();

  // Set the "Sync Rules from Labels" trigger to run at the same frequency
  ScriptApp.newTrigger('processAutoLabels')
    .timeBased()
    .everyMinutes(frequency)
    .create();

  // Set the Janitor (Retention) trigger once a day at 2 AM
  ScriptApp.newTrigger('cleanUpRetention')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();

  ui.alert(`Success! GFilter will now run every ${frequency} minutes, and Cleanup will run daily at 2 AM.`);
}

/**
 * Deletes all triggers associated with the project to stop all automation.
 */
function stopTrigger() {
  const ui = SpreadsheetApp.getUi();
  const triggers = ScriptApp.getProjectTriggers();
  
  if (triggers.length === 0) {
    ui.alert('No active automation triggers found.');
    return;
  }

  const response = ui.alert(
    'GFilter Automation',
    `Are you sure you want to stop all automation? This will delete ${triggers.length} triggers.`,
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    triggers.forEach(t => ScriptApp.deleteTrigger(t));
    ui.alert('All automation triggers have been removed.');
  }
}
