document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("history-list");
  const clearBtn = document.getElementById("clear-btn");

  async function renderHistory() {
    const { history = [] } = await chrome.storage.local.get("history");

    if (history.length === 0) {
      list.innerHTML =
        '<li class="empty-state">No pages logged yet. Visit any site!</li>';
      return;
    }

    list.innerHTML = history
      .map(
        (item) => `
      <li>
        <div class="item-title" title="${item.title}">${item.title}</div>
        <div class="item-meta">
          ${item.wordCount} words • ~${item.readTime} min read • <small>${item.scrapedAt}</small>
        </div>
      </li>
    `,
      )
      .join("");
  }

  // Clear storage on click
  clearBtn.addEventListener("click", async () => {
    await chrome.storage.local.remove("history");
    renderHistory();
  });

  // Initial render
  renderHistory();
});
