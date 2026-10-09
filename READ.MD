# Page Insights & Web Scraper (Manifest V3)

A lightweight Google Chrome extension built to demonstrate cross-context execution and client-side data persistence under the Manifest V3 architecture.

The extension injects a content script directly into any active webpage to extract reading metrics, inserts an isolated floating UI pill into the live DOM, and synchronizes the extracted data into persistent browser storage for review inside an extension popup dashboard.

---

## Architecture Overview

This project highlights the communication and boundaries between two separate extension execution contexts:

```
┌─────────────────────────────────────────────────────────────┐
│                       CHROME BROWSER                        │
│                                                             │
│   ┌──────────────────────────┐   Reads history              │
│   │   Popup Dashboard UI     │◄───────────────────┐         │
│   │   (popup.html / .js)     │                    │         │
│   └──────────────────────────┘                    │         │
│                                                   │         │
│                                            chrome.storage   │
│                                              .local (disk)  │
│   ┌──────────────────────────────────────────┐    │         │
│   │               Host Webpage               │    │         │
│   │  ┌────────────────────────────────────┐  │    │         │
│   │  │   Content Script (content.js)      │──┼────┘         │
│   │  │   • Scrapes DOM metrics            │  │ Writes data  │
│   │  │   • Injects floating UI pill       │  │              │
│   │  └────────────────────────────────────┘  │              │
│   └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘

```

1. **Content Script (`content.js`):** Runs within the host webpage’s isolated world. It waits for the DOM to parse (`document_idle`), inspects `document.body` to calculate word counts and estimated read times, renders a dismissible floating badge into the page tree, and writes the structured data to `chrome.storage.local`.
2. **Popup UI (`popup.html` & `popup.js`):** Lives entirely in the browser toolbar frame. When opened, it queries `chrome.storage.local` to render a reverse-chronological list of the last 10 visited and analyzed pages, with options to purge storage.

---

## Features

- **DOM Text Extraction:** Computes live word counts and dynamic reading times across any public website.
- **Non-Destructive UI Injection:** Injects a modern floating metric badge into the viewport (`z-index: 2147483647`) with close handling.
- **Persistent Storage:** Utilizes the asynchronous `chrome.storage.local` API (Promise-based) to retain session history across tab closures and browser restarts.
- **History Management:** Automatically de-duplicates URLs, caps the retained history to the 10 most recent entries, and includes an instant cache-clearing mechanism from the popup interface.

---

## Project Structure

```text
page-insights/
├── manifest.json      # Extension blueprint & permissions declaration
├── content.js         # Injected DOM scraping and badge injection script
├── popup.html         # Toolbar popup markup
├── popup.css          # Toolbar dashboard styling
└── popup.js           # Asynchronous storage reader & UI renderer

```

---

## Key Manifest V3 Concepts Implemented

### 1. Granular Permissions (`storage`)

Under Manifest V3, broad permissions are restricted. This project avoids invasive permissions (like `webRequest` or `cookies`) and strictly requests `"storage"`, allowing access to the browser's persistent key-value disk storage without triggering security warnings on installation.

### 2. Isolated World DOM Injection

`content.js` shares the DOM hierarchy with the host page without polluting the page's global JavaScript runtime or exposing extension logic to hostile site scripts.

### 3. Execution Timing (`document_idle`)

Configured via `content_scripts[0].run_at: "document_idle"`. The browser defers execution until the primary document parsing is complete, ensuring scraping runs without degrading page load performance.

---

## Installation & Local Development

1. Clone or download this directory to your local machine.
2. Open Google Chrome and enter `chrome://extensions` in the address bar.
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click **Load unpacked** in the top-left menu.
5. Select the `page-insights` directory containing `manifest.json`.
6. Navigate to any website (e.g., Wikipedia, a news article, or a blog post).
7. View the injected metrics pill in the bottom-right corner of the page, or click the extension icon in your browser toolbar to view stored historical records.
