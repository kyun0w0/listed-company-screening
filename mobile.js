const rawRows = window.SCREENING_DATA.rows;
const meta = window.SCREENING_DATA.meta;

const $ = (id) => document.getElementById(id);
const searchInput = $("searchInput");

const sortLabels = {
  "marketCap-desc": "시가총액 높은순",
  "marketCap-asc": "시가총액 낮은순",
  "avgPer-asc": "PER 낮은순",
  "avgPer-desc": "PER 높은순",
  "avgRevenue-desc": "3년 평균 매출 높은순",
  "avgRevenue-asc": "3년 평균 매출 낮은순",
  "avgOperatingProfit-desc": "3년 평균 영업이익 높은순",
  "avgOperatingProfit-asc": "3년 평균 영업이익 낮은순",
  "avgNetIncome-desc": "3년 평균 순이익 높은순",
  "avgNetIncome-asc": "3년 평균 순이익 낮은순",
  "majorShareholderRatio-desc": "지분율 높은순",
  "majorShareholderRatio-asc": "지분율 낮은순",
  "name-asc": "종목명 가나다순"
};

let activeSort = "marketCap-desc";
let currentRows = [];

const rows = rawRows.map((row) => ({
  ...row,
  note: row.note || ""
}));

function init() {
  $("rowCount").textContent = `전체 ${meta.rowCount.toLocaleString("ko-KR")}개사`;
  searchInput.addEventListener("input", render);
  document.querySelectorAll(".sort-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeSort = button.dataset.sort;
      document.querySelectorAll(".sort-btn").forEach((item) => item.classList.toggle("active", item === button));
      $("sortLabel").textContent = sortLabels[activeSort];
      render();
    });
  });
  $("noteClose").addEventListener("click", closeNote);
  $("noteModal").addEventListener("click", (event) => {
    if (event.target.id === "noteModal") closeNote();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNote();
  });
  render();
}

function render() {
  currentRows = applyFilters().sort(sorter(activeSort));
  $("visibleCount").textContent = `표시 ${currentRows.length.toLocaleString("ko-KR")}개사`;
  renderCards(currentRows);
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  return rows.filter((row) => !query || row.name.toLowerCase().includes(query));
}

function renderCards(data) {
  const wrap = $("cardList");
  if (!data.length) {
    wrap.innerHTML = `<div class="empty">조건에 맞는 기업이 없습니다.</div>`;
    return;
  }

  wrap.innerHTML = data.map((row) => `
    <article class="company-card">
      <div class="card-top">
        <div>
          <div class="company-name">
            <h2>${escapeHtml(row.name)}</h2>
            ${renderNoteButton(row)}
          </div>
          <span class="code">${escapeHtml(row.code)}</span>
        </div>
        <strong class="per-chip">PER ${formatNumber(row.avgPer, 1)}</strong>
      </div>
      <div class="metrics">
        <div class="metric"><span>시가총액</span><strong>${formatNumber(row.marketCap, 0)}</strong></div>
        <div class="metric"><span>지분율</span><strong>${formatPercent(row.majorShareholderRatio)}</strong></div>
        <div class="metric"><span>3년 평균 매출</span><strong>${formatNumber(row.avgRevenue, 0)}</strong></div>
        <div class="metric"><span>3년 평균 영업이익</span><strong>${formatNumber(row.avgOperatingProfit, 0)}</strong></div>
        <div class="metric"><span>3년 평균 순이익</span><strong>${formatNumber(row.avgNetIncome, 0)}</strong></div>
      </div>
    </article>
  `).join("");
  bindNoteButtons(wrap);
}

function renderNoteButton(row) {
  if (!row.note) return "";
  return `<button class="note-btn" type="button" data-name="${escapeHtml(row.name)}" data-note="${escapeHtml(row.note)}">비고</button>`;
}

function bindNoteButtons(scope) {
  scope.querySelectorAll(".note-btn").forEach((button) => {
    button.addEventListener("click", () => openNote(button.dataset.name, button.dataset.note));
  });
}

function openNote(name, note) {
  $("noteTitle").textContent = `${name} 비고`;
  $("noteText").textContent = note;
  $("noteModal").classList.remove("hidden");
}

function closeNote() {
  $("noteModal").classList.add("hidden");
}

function sorter(key) {
  const [field, direction] = key.split("-");
  const factor = direction === "asc" ? 1 : -1;
  return (a, b) => {
    if (field === "name") return a.name.localeCompare(b.name, "ko-KR") * factor;
    return ((a[field] ?? 0) - (b[field] ?? 0)) * factor;
  };
}

function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("ko-KR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return (value * 100).toLocaleString("ko-KR", { maximumFractionDigits: 1 }) + "%";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

init();
