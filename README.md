# MProfit report to CRM CSV converter

A browser-only utility. Routine use: choose one MProfit workbook, verify its date and unchanged client/family setup, prepare and download family and client CSVs.

## One-time setup

Select the privately supplied setup JSON once per trusted browser. It combines reviewed mappings and minimal CRM identity/date fields. Setup is stored in localStorage on that browser; reports and calculated balances are never persisted or uploaded. Clear saved setup removes it. Another device or cleared browser storage requires selecting setup again.

Refresh setup whenever CRM clients, family assignments or reviewed matches change. The converter does not read live CRM: its stored dates cannot detect subsequent CRM updates. Operators must confirm the report is not older than CRM and review exclusions before importing. Unknown source families block conversion; unresolved holders remain excluded.

## Import

Back up CRM, use update-existing-only, exact record IDs and the portfolio date. Family and client CSVs go to Accounts and Contacts respectively. The converter does not submit imports or connect to CRM. Gain percent is absolute gain, not XIRR.

Never commit reports, private setup, mappings, exports, generated CSVs or credentials. The public repository contains only static code and documentation. No analytics, remote scripts or network uploads are included. GitHub handles ordinary requests for the public website. No affiliation with MProfit or Zoho.

## Hosting

GitHub Pages main branch / root. No build process or backend. SheetJS is vendored; see LICENSE-SheetJS.txt.
