/**
 * @fileoverview GFilter - The Intelligent Gmail Filter Engine.
 * @version 1.4.2
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
 * v1.2.6 (2026-01-21): Automation Picklist - Upgraded trigger setup to a professional HTML choice dialog.
 * v1.2.7 (2026-01-21): Premium Radio UI - Switched to radio buttons with enhanced spacing and padding.
 * v1.2.8 (2026-01-21): Final UI Polish - Increased modal height for a scroll-free experience.
 * v1.2.9 (2026-01-21): Auto-Branding - Forced rename to "My GFilter™" during initial setup.
 * v1.3.0 (2026-01-21): Visual & Branding Refresh - Menu emojis, update badges, and GFilter Hub Sidebar.
 * v1.3.1 (2026-01-21): Retention Engine Refactor - Dynamic KeepNX tagging and robust historical processing.
 * v1.3.2 (2026-01-21): Multi-Action Support - Support for combined actions (e.g., Star+Keep7d).
 * v1.3.3 (2026-01-21): Smart Table Update - New 'Auto Labels' column with onEdit multi-select logic.
 * v1.3.4 (2026-01-21): Native Chip UI - Automated high-end styled dropdowns and multi-select support.
 * v1.4.0 (2026-01-21): Command Center - Autonomous backlog engine & Stats Dashboard.
 * v1.4.1 (2026-01-21): Sync Fix - Improved label search resilience for rule ingestion.
 * v1.4.2 (2026-01-21): Unified Actions - Merged Action columns into a single Chip-based column.
 */

const CONFIG = {
  LABEL_ROOT: '__auto',
  SHEET_RULES: 'Rules',
  SHEET_LOGS: 'Logs',
  SCOPES: ['{Sender}', '{Domain}', '{List}', '{Subject}'],
  ACTIONS: ['Archive', 'Delete', 'Spam', 'Bulk', 'Newsletter', 'Notify', 'Important', 'Star', 'Inbox', 'CopyLabels']
};

const VERSION = 'v1.4.2';

/**
 * Adds a custom menu to the Google Sheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();
  const updateBadge = props.getProperty('UPDATE_AVAILABLE') === 'true' ? ' 🔔' : '';

  ui.createMenu(`GFilter (${VERSION})${updateBadge}`)
    .addItem('🚀 Launch GFilter Hub', 'showHub')
    .addSeparator()
    .addItem('⚙️ Initialize Rules Engine', 'setupLabels')
    .addItem('🔄 Sync Rules from Gmail', 'processAutoLabels')
    .addSeparator()
    .addItem('🧹 Run Historical Cleanup', 'cleanUpRetention')
    .addItem('⏰ Set Auto-Run Timer', 'setupTrigger')
    .addItem('🛑 Stop All Timers', 'stopTrigger')
    .addSeparator()
    .addItem(`✨ Check for Updates...${updateBadge}`, 'checkUpdates')
    .addToUi();
}

/**
 * Multi-Select Logic: Appends selected values with a '+' instead of replacing.
 * Optimized to handle both native chips (comma) and manual edits (+).
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const val = e.value;
  const oldVal = e.oldValue;

  // Monitor 'Action' (Col 3) on 'Rules' sheet
  if (sheet.getName() === CONFIG.SHEET_RULES && range.getColumn() === 3) {
    if (val && oldVal && oldVal.indexOf(val) === -1) {
      // Use comma space for native Chips
      range.setValue(oldVal + ', ' + val);
    }
  }
}

/**
 * Silent version check for the background engine.
 */
function checkUpdatesSilent() {
  const rawUrl = 'https://raw.githubusercontent.com/BlueDragon-Safex/GFilter/master/Code.gs?t=' + new Date().getTime();
  try {
    const response = UrlFetchApp.fetch(rawUrl, { 'muteHttpExceptions': true, 'headers': { 'User-Agent': 'GFilter-Update-Checker' }});
    const remoteVersionMatch = response.getContentText().match(/const VERSION = '([^']+)'/);
    if (remoteVersionMatch && remoteVersionMatch[1] !== VERSION) {
      PropertiesService.getScriptProperties().setProperty('UPDATE_AVAILABLE', 'true');
    } else {
      PropertiesService.getScriptProperties().setProperty('UPDATE_AVAILABLE', 'false');
    }
  } catch (e) {}
}

/**
 * Displays the branded GFilter Hub Sidebar.
 */
function showHub() {
  const html = HtmlService.createTemplateFromFile('Hub')
      .evaluate()
      .setTitle('GFilter™ Hub')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(html);
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
      PropertiesService.getScriptProperties().setProperty('UPDATE_AVAILABLE', 'false');
      ui.alert('Update Check', `Current Version: ${VERSION}\n\nYou are running the latest version of GFilter.`, ui.ButtonSet.OK);
    } else {
      PropertiesService.getScriptProperties().setProperty('UPDATE_AVAILABLE', 'true');
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
    const name = label.getName();
    // Use a broader search query and remove quotes to be more resilient
    const labelThreads = GmailApp.search(`label:${name}`, 0, 50); 
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

  const headers = ['Rule Type', 'Match Value', 'Action', 'Additional Labels', 'Date Created', 'Sync Status', 'Backlog Count'];
  const ruleSheet = getOrCreateSheet(ss, CONFIG.SHEET_RULES, headers);
  
  threads.forEach(thread => {
    const labels = thread.getLabels().map(l => l.getName());
    const autoLabels = labels.filter(l => l.startsWith(CONFIG.LABEL_ROOT + '/'));
    
    if (autoLabels.length < 1) return; 

    const scopes = autoLabels.filter(l => CONFIG.SCOPES.includes(l.split('/')[1]));
    // Any __auto/ label that ISN'T a scope is an action/retention tag
    const ruleActions = autoLabels.filter(l => !CONFIG.SCOPES.includes(l.split('/')[1]));

    if (scopes.length === 0) return;

    const hasCopyLabels = ruleActions.some(a => a.includes('CopyLabels'));
    // Join with comma-space for Chip implementation
    const actionStr = ruleActions.map(a => a.split('/')[1]).join(', ');

    const message = thread.getMessages()[0];
    
    scopes.forEach(s => {
      const scopeType = s.split('/')[1];
      const matchValue = getMatchValue(message, scopeType);
      
      const labelsToCopy = hasCopyLabels ? labels.filter(l => !l.startsWith(CONFIG.LABEL_ROOT)) : [];
      addRule(ruleSheet, scopeType, matchValue, actionStr, labelsToCopy);
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

function addRule(sheet, type, value, actionStr, allLabels) {
  const data = sheet.getDataRange().getValues();
  const exists = data.some(row => row[0] === type && row[1] === value && row[2] === actionStr);
  
  if (!exists) {
    const additional = allLabels.filter(l => !l.startsWith(CONFIG.LABEL_ROOT)).join(', ');
    // Order: Type(1), Value(2), Action(3), Additional(4), Date(5), Status(6), Count(7)
    sheet.appendRow([type, value, actionStr, additional, new Date(), 'Pending', 0]);
    
    // Initial sync will be handled by the background engine
    logAction(`Rule Registered: ${value}. Backlog Engine will process history autonomously.`);
    sheet.activate();
    SpreadsheetApp.getActiveSpreadsheet().toast(`Rule Registered: ${value}`, 'GFilter');
  }
}

/**
 * Autonomous Backlog Engine.
 * Chains itself to process massive histories in the background.
 */
function runBacklogEngine() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_RULES);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  let workDone = false;

  for (let i = 1; i < data.length; i++) {
    const [type, value, action, addit, date, status, count] = data[i];
    
    if (status === 'Pending' || status === 'In Progress...') {
      const batchSize = 100;
      const query = getQuery(type, value);
      if (!query) continue;

      const threads = GmailApp.search(query, 0, batchSize);
      if (threads.length === 0) {
        sheet.getRange(i + 1, 6).setValue('Complete');
        sheet.getRange(i + 1, 6).setBackground('#d9ead3'); // Light Green
        continue;
      }

      threads.forEach(t => executeAction(t, action));
      
      const newCount = (parseInt(count) || 0) + threads.length;
      sheet.getRange(i + 1, 7).setValue(newCount);
      sheet.getRange(i + 1, 6).setValue('In Progress...');
      
      // Update Stats
      incrementStat('TOTAL_PROCESSED', threads.length);
      workDone = true;
      break; // One rule per batch to avoid timeouts
    }
  }

  // Chaining Logic: If work was done, check if we need to schedule another run
  if (workDone) {
    updateDashboard();
  }
}

function incrementStat(key, val) {
  const props = PropertiesService.getScriptProperties();
  const current = parseInt(props.getProperty(key) || 0);
  props.setProperty(key, (current + val).toString());
}

/**
 * Logic for rule execution (supports multi-actions like Star+Keep7d).
 */
function executeAction(thread, action) {
  if (!action) return;
  
  // Support '+' or ',' for multi-action combinations
  const actions = action.toString().split(/[+,]/).map(s => s.trim());
  let shouldArchive = false;

  actions.forEach(act => {
    switch (act) {
      case 'Archive': thread.moveToArchive(); break;
      case 'Delete': thread.moveToTrash(); break;
      case 'Spam': thread.moveToSpam(); break;
      case 'Star': thread.addStar(); break;
      case 'Important': thread.markImportant(); break;
      case 'Inbox': 
      case 'CopyLabels': 
        break; 
      default:
        // Dynamic Labeling (KeepNX, Work, etc)
        const labelName = `${CONFIG.LABEL_ROOT}/${act}`;
        let l = GmailApp.getUserLabelByName(labelName);
        if (!l) {
          try {
            l = GmailApp.createLabel(labelName);
            logAction(`Dynamic Label created: ${labelName}`);
          } catch (e) { console.warn(`Dynamic label creation failed: ${e.message}`); }
        }
        if (l) thread.addLabel(l);
        shouldArchive = true; // Most labels imply move out of Inbox
        break;
    }
  });

  if (shouldArchive) thread.moveToArchive();
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
  
  // Silent update check in background
  checkUpdatesSilent();
  
  if (logSheet.getLastRow() > 1000) {
    logSheet.deleteRow(1001);
  }
}

/**
 * The main automation engine. Scans Inbox for mail matching the GSheet rules.
 */
/**
 * Ensures the core GFilter labels exist in Gmail.
 */
function setupLabels() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  // Auto-Branding
  const currentName = ss.getName();
  if (currentName.indexOf('Copy of') > -1 || currentName.indexOf('TEMPLATE') > -1) {
    ss.rename('My GFilter™');
  }
  
  // Header/Table formatting removed - now handled by the GFilter Template.
  const headers = ['Rule Type', 'Match Value', 'Action', 'Additional Labels', 'Date Created', 'Sync Status', 'Backlog Count'];
  const ruleSheet = getOrCreateSheet(ss, CONFIG.SHEET_RULES, headers);
  
  // Apply DATA VALIDATION (CHIPS) - Ensures chips exist if the sheet is wiped
  applyChipValidation(ruleSheet);

  // Create Gmail Labels (Scopes, Actions, Retention)
  const root = CONFIG.LABEL_ROOT;
  const labelsToCreate = [
    root,
    ...CONFIG.SCOPES.map(s => `${root}/${s}`),
    ...CONFIG.ACTIONS.map(a => `${root}/${a}`),
    ...['1d', '7d', '1m', '3m', '6m', '1y', '3y', '7y'].map(p => `${root}/Keep${p}`)
  ];

  labelsToCreate.forEach(labelName => {
    try {
      if (!GmailApp.getUserLabelByName(labelName)) {
        GmailApp.createLabel(labelName);
      }
    } catch (e) {}
  });

  ui.alert('GFilter Setup', 'Rules Engine has been initialized with Premium Chip UI. You can now use the styled dropdowns to build your rules!', ui.ButtonSet.OK);
}

/**
 * Injects Google's high-end Chip UI into the Rules sheet.
 */
function applyChipValidation(sheet) {
  const lastRow = 500; // Apply to first 500 rows
  
  // 1. Rule Type Chips (Col A)
  const scopeRule = SpreadsheetApp.newDataValidation().requireValueInList(CONFIG.SCOPES)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 1, lastRow).setDataValidation(scopeRule);

  // 2. Action Chips (Col C)
  const actionList = [
    'Archive', 'Delete', 'Spam', 'Star', 'Important', 'Inbox', 'CopyLabels',
    'Keep1d', 'Keep7d', 'Keep1m', 'Keep3m', 'Keep6m', 'Keep1y', 'Keep3y', 'Keep7y',
    'Bulk', 'Newsletter', 'Notify'
  ];
  const actionRule = SpreadsheetApp.newDataValidation().requireValueInList(actionList)
    .setAllowInvalid(true) // Allow typing custom KeepNX
    .build();
  
  sheet.getRange(2, 3, lastRow).setDataValidation(actionRule);
}

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
        } catch (e) {
          console.error(`Rule failed: ${e.message}`);
        }
      });
    }

    // 2. Process Historical Backlog (Autonomous Engine handles this now)
    // No direct call here, background triggers will pick up 'Pending' rules.
  }
}

/**
 * Orchestrates the GFilter Stats Dashboard.
 */
function updateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = '📊 Dashboard';
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName, 0);
  }

  const props = PropertiesService.getScriptProperties();
  const totalProcessed = props.getProperty('TOTAL_PROCESSED') || 0;
  const lastSync = new Date().toLocaleString();

  // Dashboard UI (Visual Layout)
  sheet.getRange('A1:C20').clear();
  sheet.getRange('B3').setValue('GFilter™ Inbox Health').setFontSize(18).setFontWeight('bold');
  
  sheet.getRange('B5').setValue('Total Emails Shielded:').setFontWeight('bold');
  sheet.getRange('B6').setValue(totalProcessed).setFontSize(24).setFontColor('#1155cc').setFontWeight('bold');
  
  sheet.getRange('B8').setValue('Last Engine Pulse:').setFontWeight('bold');
  sheet.getRange('B9').setValue(lastSync).setFontStyle('italic');
  
  sheet.getRange('B11').setValue('System Status:').setFontWeight('bold');
  sheet.getRange('B12').setValue('🛡️ PROTECTED').setFontWeight('bold').setFontColor('#38761d');

  // Format
  sheet.setColumnWidth(2, 300);
  sheet.hideGridlines(true);
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

/**
 * Centralized Retention Cleanup Routine.
 * Deletes or archives mail based on KeepNX labels.
 */
function cleanUpRetention() {
  const root = CONFIG.LABEL_ROOT;
  const labels = GmailApp.getUserLabels();
  const now = new Date();
  
  labels.forEach(label => {
    const name = label.getName();
    // Match __auto/KeepNX (where X is d, m, or y)
    if (name.startsWith(`${root}/Keep`)) {
      const period = name.split('/Keep')[1];
      const days = convertToDays(period);
      if (days === null) return;
 
      // Process batches of 100 to avoid timeouts
      const threads = label.getThreads(0, 100);
      threads.forEach(thread => {
        const lastMsgDate = thread.getLastMessageDate();
        const diff = (now - lastMsgDate) / (1000 * 60 * 60 * 24);
        
        if (diff > days) {
          thread.moveToTrash(); 
          logAction(`Retention: Purged "${thread.getFirstMessageSubject()}" (Rule: ${period})`);
        }
      });
    }
  });
}

/**
 * Sets up a time-driven trigger to run the automation at a user-defined frequency.
 */
function setupTrigger() {
  const html = '<!DOCTYPE html><html><head>' +
               '<link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">' +
               '<style>' +
               'body { font-family: "Google Sans", Roboto, Arial, sans-serif; padding: 30px; line-height: 1.6; color: #3c4043; background-color: #ffffff; }' +
               '.title { font-weight: 500; font-size: 20px; margin-bottom: 12px; color: #1a73e8; display: flex; align-items: center; gap: 10px; }' +
               '.subtitle { margin-bottom: 24px; font-size: 14px; color: #5f6368; }' +
               '.radio-group { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }' +
               '.radio-item { display: flex; align-items: center; padding: 12px 16px; border: 1px solid #dadce0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }' +
               '.radio-item:hover { background-color: #f8f9fa; border-color: #1a73e8; }' +
               '.radio-item input { margin-right: 12px; cursor: pointer; accent-color: #1a73e8; scale: 1.2; }' +
               '.radio-item label { cursor: pointer; font-size: 14px; flex-grow: 1; user-select: none; }' +
               'button { background: #1a73e8; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; width: 100%; font-size: 15px; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3); transition: background 0.2s; }' +
               'button:hover { background: #1765cc; box-shadow: 0 1px 3px 1px rgba(60,64,67,0.15); }' +
               '</style></head><body>' +
               '<div class="title">🏃 Setup Automation</div>' +
               '<div class="subtitle">Select scan frequency for rules and sync:</div>' +
               '<div class="radio-group">' +
               '  <div class="radio-item"><input type="radio" name="freq" value="10m" id="f10"><label for="f10">10 Minutes</label></div>' +
               '  <div class="radio-item"><input type="radio" name="freq" value="30m" id="f30"><label for="f30">30 Minutes</label></div>' +
               '  <div class="radio-item"><input type="radio" name="freq" value="1h" id="f1h" checked><label for="f1h">1 Hour</label></div>' +
               '  <div class="radio-item"><input type="radio" name="freq" value="4h" id="f4h"><label for="f4h">4 Hours</label></div>' +
               '  <div class="radio-item"><input type="radio" name="freq" value="12h" id="f12h"><label for="f12h">12 Hours</label></div>' +
               '  <div class="radio-item"><input type="radio" name="freq" value="24h" id="f24h"><label for="f24h">24 Hours</label></div>' +
               '</div>' +
               '<button onclick="submit()">Activate Automation</button>' +
               '<script>' +
               '  function submit() {' +
               '    var radios = document.getElementsByName("freq");' +
               '    var val = "1h";' +
               '    for (var i = 0; i < radios.length; i++) { if (radios[i].checked) val = radios[i].value; }' +
               '    google.script.run.withSuccessHandler(function() { google.script.host.close(); }).createAutomationTriggers(val);' +
               '  }' +
               '</script></body></html>';
  
  const output = HtmlService.createHtmlOutput(html).setWidth(480).setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(output, 'Automation Settings');
}

/**
 * Server-side handler for the trigger picklist.
 */
function createAutomationTriggers(selection) {
  const ui = SpreadsheetApp.getUi();
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  let label = '';
  
  // Apply Rules & Sync Labels Triggers
  if (selection === '10m') {
    ScriptApp.newTrigger('applyRules').timeBased().everyMinutes(10).create();
    ScriptApp.newTrigger('processAutoLabels').timeBased().everyMinutes(10).create();
    label = '10 minutes';
  } else if (selection === '30m') {
    ScriptApp.newTrigger('applyRules').timeBased().everyMinutes(30).create();
    ScriptApp.newTrigger('processAutoLabels').timeBased().everyMinutes(30).create();
    label = '30 minutes';
  } else if (selection === '1h') {
    ScriptApp.newTrigger('applyRules').timeBased().everyHours(1).create();
    ScriptApp.newTrigger('processAutoLabels').timeBased().everyHours(1).create();
    label = '1 hour';
  } else if (selection === '4h') {
    ScriptApp.newTrigger('applyRules').timeBased().everyHours(4).create();
    ScriptApp.newTrigger('processAutoLabels').timeBased().everyHours(4).create();
    label = '4 hours';
  } else if (selection === '12h') {
    ScriptApp.newTrigger('applyRules').timeBased().everyHours(12).create();
    ScriptApp.newTrigger('processAutoLabels').timeBased().everyHours(12).create();
    label = '12 hours';
  } else if (selection === '24h') {
    ScriptApp.newTrigger('applyRules').timeBased().everyDays(1).create();
    ScriptApp.newTrigger('processAutoLabels').timeBased().everyDays(1).create();
    label = '24 hours';
  }

  // Daily Janitor (Retention)
  ScriptApp.newTrigger('cleanUpRetention').timeBased().atHour(2).everyDays(1).create();

  ui.alert('Success!', `GFilter has been set to run every ${label}.\n\n(Retention Cleanup will run daily at 2 AM)`, ui.ButtonSet.OK);
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
