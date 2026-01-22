/**
 * @fileoverview GFilter - The Intelligent Gmail Filter Engine.
 * @version 1.2.5
 * @date 2026-01-21
 * @copyright (c) 2026 123 PROPERTY INVESTMENT GROUP, INC. All Rights Reserved.
 * @license Proprietary
 * @author 123 PROPERTY INVESTMENT GROUP, INC.
 * @contact BlueDragon.Safex@Gmail.com
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
 * v1.1.3 (2026-01-21): Efficiency Boost - processAutoLabels now only scans the last 7 days of tagged mail.
 * v1.1.4 (2026-01-21): Integrated Update Delivery - Added a "Copy-Ready" update modal for effortless upgrades.
 * v1.1.5 (2026-01-21): Production Release - Final version for current testing cycle.
 * v1.1.6 (2026-01-21): Fixed Modal Glitch - Resolved nested backtick issues in the update modal.
 * v1.1.7 (2026-01-21): Final Modal Verification Release.
 * v1.1.8 (2026-01-21): Resilience Update - Added cache-busting & headers to resolve intermittent 404/DNS issues.
 * v1.1.9 (2026-01-21): Final Release Candidate - Verifying the resilient update delivery system.
 * v1.2.0 (2026-01-21): Bulletproof Release - Fixed "Double Code" leak by escaping HTML tags in delivery.
 * v1.2.1 (2026-01-21): Pro Update Engine - Used JSON.stringify for "Native" safe code delivery.
 * v1.2.2 (2026-01-21): Release Candidate - Final polishing and legal header refinement.
 * v1.2.3 (2026-01-21): Template Release - Used native Apps Script Templates for 100% reliable code delivery.
 * v1.2.4 (2026-01-21): Final Sign-off - Verifying the official template-based update delivery.
 * v1.2.5 (2026-01-21): Trigger Fix & Master Link - Resolved 60min trigger bug and added official GSheet copy link.
 */

const CONFIG = {
  LABEL_ROOT: '__auto',
  SHEET_RULES: 'Rules',
  SHEET_LOGS: 'Logs',
  SCOPES: ['{Sender}', '{Domain}', '{List}', '{Subject}'],
  ACTIONS: ['Archive', 'Delete', 'Spam', 'Bulk', 'Newsletter', 'Notify', 'Important', 'Star', 'Inbox', 'CopyLabels']
};

const VERSION = 'v1.2.5';

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
  const rawUrl = 'https://raw.githubusercontent.com/BlueDragon-Safex/GFilter/master/Code.gs?t=' + new Date().getTime();
  
  try {
    const options = {
      'muteHttpExceptions': true,
      'headers': {
        'User-Agent': 'GFilter-Update-Checker'
      }
    };
    const response = UrlFetchApp.fetch(rawUrl, options);
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
        `A newer version (${remoteVersion}) is available on GitHub!\n\nYour Version: ${VERSION}\nLatest Version: ${remoteVersion}\n\nWould you like to get the latest code now?`, 
        ui.ButtonSet.YES_NO
      );
      if (response === ui.Button.YES) {
        showUpdateModal(remoteVersion, content);
      }
    }
  } catch (e) {
    ui.alert('Update Check', `Failed to check for updates: ${e.message}`, ui.ButtonSet.OK);
  }
}

function showUpdateModal(version, code) {
  const template = HtmlService.createTemplate(
    '<!DOCTYPE html><html><head>' +
    '<link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">' +
    '<style>' +
    'body { font-family: sans-serif; padding: 10px; line-height: 1.4; color: #333; }' +
    '.step { margin-bottom: 8px; font-weight: bold; }' +
    'textarea { width: 95%; height: 280px; font-family: monospace; font-size: 11px; margin: 10px 0; border: 1px solid #ccc; padding: 5px; background: #f9f9f9; resize: none; }' +
    '.footer { font-size: 11px; color: #888; margin-top: 10px; }' +
    'button { background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }' +
    'button:hover { background: #357ae8; }' +
    '</style></head><body>' +
    '<div class="step">✨ Version <?= version ?> is ready!</div>' +
    '<ol style="font-size: 13px;">' +
    '<li>Click <b>Copy to Clipboard</b> below.</li>' +
    '<li>Go to <b>Extensions > Apps Script</b>.</li>' +
    '<li>Delete everything in <b>Code.gs</b> and <b>Paste</b> the new code.</li>' +
    '<li>Save and refresh this Google Sheet.</li></ol>' +
    '<textarea id="codeBlock" readonly><?= code ?></textarea>' +
    '<div style="text-align: center;">' +
    '<button onclick="copyToClipboard()">Copy to Clipboard</button></div>' +
    '<div class="footer">Official Source: https://github.com/BlueDragon-Safex/GFilter</div>' +
    '<script>' +
    '  function copyToClipboard() {' +
    '    var copyText = document.getElementById("codeBlock");' +
    '    copyText.select();' +
    '    document.execCommand("copy");' +
    '    alert("Code copied! Now go to Apps Script, delete the old code, and paste this in.");' +
    '  }' +
    '</script></body></html>'
  );

  template.version = version;
  template.code = code;

  const output = template.evaluate()
    .setWidth(600)
    .setHeight(550)
    .setTitle('GFilter Update Delivery: ' + version);
    
  SpreadsheetApp.getUi().showModalDialog(output, 'Update Instructions');
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
  
  // Collect all threads from all __auto/ sub-labels (Recent only)
  autoSubLabels.forEach(label => {
    // Only grab threads from the last 7 days to keep the sync lightning fast
    const labelThreads = GmailApp.search(`label:"${label.getName()}" newer_than:7d`, 0, 20); 
    labelThreads.forEach(t => threadMap.set(t.getId(), t));
  });
  
  // Also check for the root label just in case
  const rootLabel = GmailApp.getUserLabelByName(root);
  if (rootLabel) {
    const rootThreads = GmailApp.search(`label:"${root}" newer_than:7d`, 0, 20);
    rootThreads.forEach(t => threadMap.set(t.getId(), t));
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
    'How often should GFilter process your rules?\n\nEnter "1", "5", "10", "15", "30", or "60" (minutes):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const frequency = parseInt(response.getResponseText());
  const validFrequencies = [1, 5, 10, 15, 30, 60];
  
  if (!validFrequencies.includes(frequency)) {
    ui.alert('Invalid frequency. Please enter 1, 5, 10, 15, 30, or 60.');
    return;
  }

  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Set the main rule engine trigger
  let mainTrigger = ScriptApp.newTrigger('applyRules').timeBased();
  if (frequency === 60) {
    mainTrigger.everyHours(1).create();
  } else {
    mainTrigger.everyMinutes(frequency).create();
  }

  // Set the "Sync Rules from Labels" trigger to run at the same frequency
  let syncTrigger = ScriptApp.newTrigger('processAutoLabels').timeBased();
  if (frequency === 60) {
    syncTrigger.everyHours(1).create();
  } else {
    syncTrigger.everyMinutes(frequency).create();
  }

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
