# MProfit report to CRM CSV converter

A static, browser-only file conversion utility. It prepares separate family Account and individual Contact CSVs for manual Zoho CRM import.

## Use

1. Choose the complete MProfit Global Reporting Workbook and its valuation date.
2. Choose current CRM Contacts and Accounts CSV exports, plus your privately supplied reviewed mapping JSON.
3. Prepare CSVs, review totals and exclusions, then download the required output.
4. Import into the appropriate CRM module using update-existing-only and exact record IDs. The converter does not connect to CRM or submit imports.

Files are read locally in your browser and are not uploaded by the converter. Reloading clears selected files and results. No analytics or remote scripts are included. The hosting provider handles ordinary requests for this public website.

Never commit reports, CRM exports, private mappings, generated CSVs, credentials or client data to this repository. All private files must be supplied locally by the operator. Unknown mappings and conflicting record dates require review.

Gain percent is absolute gain, not XIRR. Family and individual totals overlap and must not be added together. This utility is not affiliated with MProfit or Zoho.

## Hosting

GitHub Pages: deploy the root of the main branch. All paths are relative. No build process, backend, subscription, WordPress plugin or Zoho Flow is required for conversion. Vendored SheetJS licensing is in LICENSE-SheetJS.txt.
