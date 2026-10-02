# MProfit report to CRM CSV converter

Everyone receives the same published client list and reviewed mappings automatically. Choose the MProfit workbook, confirm the report date and current client/family assignments, then prepare and download CSVs. No setup-file upload, browser storage or login is needed for routine conversion.

## Shared list

The owner explicitly authorized publishing the minimal client list and reviewed matching information globally. shared-clients.js includes client/family names, CRM record IDs, family associations, portfolio-date checks and reviewed MProfit-name matches. It excludes report rows, balances, PAN, phone numbers, email addresses and credentials. This file is public. Reports are processed in memory and are not uploaded or persisted.

The initial shared snapshot uses Contacts from30September2026 and Accounts from1October2026. It is not a live CRM connection. Confirm freshness before importing.

## New clients and updates

Create the Contact and family association in CRM first. Under Manage clients, preview refreshed full Contacts exports and Accounts exports for new families. Review new/unmatched clients, select exact records and apply matches. Changes affect the current session only. Download the updated list and have the implementation team publish it to shared-clients.js once; thereafter every visitor loads the updated shared list. Do not assume the browser can directly publish to GitHub or automatically sync CRM. No GitHub credentials are included in the page.

## Import

Back up CRM. Import family and client CSVs separately into Accounts and Contacts using update-existing-only and exact record IDs. This tool does not submit imports. Gain percent is absolute gain, not XIRR. Ambiguous records remain excluded.

## Hosting

GitHub Pages main branch/root, no backend. SheetJS is vendored; see LICENSE-SheetJS.txt. No affiliation with MProfit or Zoho. No analytics or report-upload requests. GitHub handles normal requests for public files.
