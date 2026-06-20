// Renders the /projects/ page entirely from GitHub's public REST API.
// Data source: https://api.github.com (no API key required for public read-only data).
// - Fetches all public repos for github_username (see _config.yml), sorted by last-pushed.
// - Filters out forks (forked repos aren't "your" work for portfolio purposes).
// - Unauthenticated rate limit is 60 requests/hour per visitor IP, which is
//   fine since this runs client-side once per page load.

(function () {
  var GITHUB_USERNAME = "josephinealinea";
  var API_URL =
    "https://api.github.com/users/" + GITHUB_USERNAME +
    "/repos?type=public&sort=pushed&direction=desc&per_page=100";

  function formatDate(isoString) {
    var d = new Date(isoString);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCard(repo) {
    var article = document.createElement("article");
    article.className = "post-card";

    var metaHtml = "<div class=\"post-meta\"><span class=\"post-date\">Updated " + formatDate(repo.pushed_at) + "</span>";
    if (repo.language) metaHtml += "&nbsp;<span class=\"tag\">" + escapeHtml(repo.language) + "</span>";
    if (repo.stargazers_count > 0) metaHtml += "<span class=\"tag\">★ " + repo.stargazers_count + "</span>";
    metaHtml += "</div>";

    article.innerHTML =
      metaHtml +
      "<h3 class=\"post-title\"><a class=\"post-link\" href=\"" + repo.html_url + "\" target=\"_blank\" rel=\"noopener\">" +
      escapeHtml(repo.name) + "</a></h3>" +
      "<div class=\"post-excerpt\">" + escapeHtml(repo.description || "No description provided.") + "</div>" +
      "<a href=\"" + repo.html_url + "\" class=\"read-more\" target=\"_blank\" rel=\"noopener\">View on GitHub →</a>";

    return article;
  }

  function renderError(container, message) {
    container.innerHTML = "<p class=\"projects-error\">" + escapeHtml(message) + "</p>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("github-projects");
    if (!container) return;

    fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API request failed (" + res.status + ")");
        return res.json();
      })
      .then(function (repos) {
        var filtered = repos.filter(function (r) { return !r.fork; });
        if (filtered.length === 0) {
          renderError(container, "No public repositories found.");
          return;
        }
        container.innerHTML = "";
        filtered.forEach(function (repo) {
          container.appendChild(renderCard(repo));
        });
      })
      .catch(function () {
        renderError(
          container,
          "Couldn't load projects from GitHub right now. Try refreshing, or visit github.com/" +
            GITHUB_USERNAME + " directly."
        );
      });
  });
})();
