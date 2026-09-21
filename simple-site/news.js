/* =========================================================
   News list — edit this file to update the News box on Home.

   Each entry can have:
     date   (optional)  e.g. "Sep 2026" — shown before the item
     text   (required)  the news item; plain text or a bit of HTML
                        (links: <a href="files/x.pdf">…</a>)

   Items are shown in the order listed here. Delete an entry to retire it;
   the box disappears if the list is empty.
   ========================================================= */

var news = [
  {
    text: "I am on sabbatical for the 2026–2027 academic year and will spend the Fall Quarter at the University of Chicago.",
  },
  {
    date: "Sep 2026",
    text: '<a href="files/scir.pdf">Strategic Concealment in Innovation Races</a> has been conditionally accepted at <em>AEJ: Microeconomics</em>.',
  },
  {
    date: "Sep 2026",
    text: 'New version of <a href="files/market-based_mechanisms.pdf">Market-based Policies</a>.',
  },
];

/* ---------- rendering (no need to edit below) ---------- */
(function () {
  var box = document.getElementById("news");
  if (!box) return;
  if (!news.length) { box.style.display = "none"; return; }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  box.innerHTML = "<strong>News</strong><ul>" + news.map(function (n) {
    var date = n.date ? '<span class="date">' + esc(n.date) + "</span> " : "";
    return "<li>" + date + n.text + "</li>";
  }).join("") + "</ul>";

  // open links to PDFs / other sites in a new tab
  box.querySelectorAll("a").forEach(function (a) {
    a.target = "_blank"; a.rel = "noopener";
  });
})();
