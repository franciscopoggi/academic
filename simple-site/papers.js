/* =========================================================
   Paper list — edit this file to update the Research tab.

   Each entry can have:
     title    (required)  paper title
     pdf                  link to the PDF (or any URL); omit if none
     with                 coauthors: ["Name", "url"] pairs, or just "Name"
     status               e.g. "R&R at JPE", "Work in progress"; omit if none
     abstract             one-line abstract shown under the title; omit if none

   Papers are shown in the order listed here.
   ========================================================= */

var papers = [
  {
    title: "Strategic Concealment in Innovation Races",
    pdf: "files/scir.pdf",
    with: [["Yonggyun Kim", "https://sites.google.com/view/yonggyun-yg-kim/"]],
    status: "Conditionally accepted at AEJ: Micro",
    // abstract: "Firms might avoid patenting intermediate innovations, even when this would mean capturing the full social value of the innovation.",
  },
  {
    title: "Market-based Policies",
    pdf: "files/Market-based_Policies.pdf",
    with: [["Quitzé Valenzuela-Stookey", "http://www.quitzevalenzuelastookey.com"]],
    status: "R&R at JPE",
    // abstract: "How can policies use information contained in market outcomes when market participants care about the policy itself?",
  },
  {
    title: "A Taxation Principle with Moral Hazard",
    pdf: "files/taxation.pdf",
    with: [["Bruno Strulovici", "https://faculty.wcas.northwestern.edu/bhs675/"]],
    // abstract: "Sometimes, eliciting private information becomes redundant.",
  },
  {
    title: "The Timing of Complementary Innovations",
    pdf: "files/timing-innovations.pdf",
    // abstract: "Breakthroughs always enhance incentives to work on complementary projects, but only when the timing is endogenous.",
  },
  {
    title: "Liability Design with Information Acquisition",
    pdf: "files/liability.pdf",
    with: [["Bruno Strulovici", "https://faculty.wcas.northwestern.edu/bhs675/"]],
    // abstract: "How should liability be determined for an agent who acquires information about an unknown risk?",
  },
  {
    title: "(Un)finished Products",
    with: [["Jorge Lemus", "https://sites.google.com/site/jorgelemuswebsite/home"]],
    status: "Work in progress",
  },
  {
    title: "Off-protocol Communication",
    status: "Work in progress",
  },
];

/* ---------- rendering (no need to edit below) ---------- */
(function () {
  var list = document.getElementById("paper-list");
  if (!list) return;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function link(text, url) {
    return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>" : esc(text);
  }
  function joinNames(names) {
    if (names.length <= 1) return names.join("");
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  }

  list.innerHTML = papers.map(function (p) {
    var title = '<span class="title">' + link(p.title, p.pdf) + "</span>";

    var meta = [];
    if (p.with && p.with.length) {
      var names = p.with.map(function (c) {
        return Array.isArray(c) ? link(c[0], c[1]) : esc(c);
      });
      meta.push("with " + joinNames(names));
    }
    if (p.status) meta.push('<span class="status">' + esc(p.status) + "</span>");
    var metaHtml = meta.length ? '<span class="meta">' + meta.join(" ") + "</span>" : "";

    var abstract = p.abstract ? '<p class="abstract">' + esc(p.abstract) + "</p>" : "";

    return '<div class="paper"><p class="paper-head">' + title + metaHtml + "</p>" + abstract + "</div>";
  }).join("\n");
})();
