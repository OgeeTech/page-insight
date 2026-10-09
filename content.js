// 1. Scrape data from the page DOM
function extractMetrics() {
  const pageTitle = document.title || "Untitled";
  const bodyText = document.body ? document.body.innerText : "";

  // Word count calculation
  const words = bodyText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    title: pageTitle,
    url: window.location.href,
    wordCount: words,
    readTime: readTimeMinutes,
    scrapedAt: new Date().toLocaleTimeString(),
  };
}

// 2. Inject a custom visual element into the host page
function injectUIBadge(metrics) {
  // Prevent duplicate injection if script runs again
  if (document.getElementById("insights-pill-container")) return;

  const badge = document.createElement("div");
  badge.id = "insights-pill-container";
  badge.innerHTML = `
    <span>📊 <strong>${metrics.wordCount}</strong> words (~${metrics.readTime} min read)</span>
    <button id="insights-close-btn" style="margin-left: 8px; background: none; border: none; color: #fff; cursor: pointer; font-size: 12px;">✕</button>
  `;

  // Inline styling keeps the injected element isolated from page CSS
  Object.assign(badge.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "2147483647", // Highest integer z-index so it stays visible on top
    backgroundColor: "#111827",
    color: "#F9FAFB",
    padding: "8px 14px",
    borderRadius: "9999px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
    fontSize: "12px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    alignItems: "center",
    transition: "transform 0.2s ease, opacity 0.2s ease",
  });

  document.body.appendChild(badge);

  // Allow user to dismiss the injected badge
  document
    .getElementById("insights-close-btn")
    .addEventListener("click", () => {
      badge.remove();
    });
}

// 3. Persist the metrics into chrome.storage.local
async function persistPageData(metrics) {
  // Retrieve existing stored items or default to an empty array
  const { history = [] } = await chrome.storage.local.get("history");

  // Keep the 10 most recent pages
  const updatedHistory = [
    metrics,
    ...history.filter((item) => item.url !== metrics.url),
  ].slice(0, 10);

  await chrome.storage.local.set({ history: updatedHistory });
}

// Execution entry point
const metrics = extractMetrics();
injectUIBadge(metrics);
persistPageData(metrics);
