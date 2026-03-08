const sampleText = `CS 499 - Product Engineering
Homework 1 due March 8, 2026
Lab 2 due March 13, 2026
Team Project Proposal due March 18, 2026
Midterm Exam on March 24, 2026
Assignment 3 due April 2, 2026
Group Project Milestone due April 10, 2026
Final Presentation due April 18, 2026
Final Exam April 22, 2026`;

const weekdays = [
  ["monday", "Mon"],
  ["tuesday", "Tue"],
  ["wednesday", "Wed"],
  ["thursday", "Thu"],
  ["friday", "Fri"],
  ["saturday", "Sat"],
  ["sunday", "Sun"],
];

const defaultHours = {
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 2,
  friday: 1.5,
  saturday: 3,
  sunday: 3,
};

const syllabusText = document.getElementById("syllabusText");
const loadSampleBtn = document.getElementById("loadSample");
const resetHoursBtn = document.getElementById("resetHours");
const analyzeBtn = document.getElementById("analyzeBtn");
const whatIfBtn = document.getElementById("whatIfBtn");
const whatIfBoostInput = document.getElementById("whatIfBoost");
const downloadIcsBtn = document.getElementById("downloadIcsBtn");
const statusText = document.getElementById("statusText");
const hoursGrid = document.getElementById("hoursGrid");
const startDateInput = document.getElementById("startDate");
const briefBadge = document.getElementById("briefBadge");
const briefHeadline = document.getElementById("briefHeadline");
const briefSchema = document.getElementById("briefSchema");
const briefParserMode = document.getElementById("briefParserMode");
const briefCalendarReady = document.getElementById("briefCalendarReady");
const briefRouteCount = document.getElementById("briefRouteCount");
const briefReviewFlow = document.getElementById("briefReviewFlow");
const briefTwoMinuteReview = document.getElementById("briefTwoMinuteReview");
const briefOperatorRules = document.getElementById("briefOperatorRules");
const briefStageContract = document.getElementById("briefStageContract");
const briefProofAssets = document.getElementById("briefProofAssets");
const briefWatchouts = document.getElementById("briefWatchouts");
const reviewPackBadge = document.getElementById("reviewPackBadge");
const reviewPackHeadline = document.getElementById("reviewPackHeadline");
const reviewPackRuntime = document.getElementById("reviewPackRuntime");
const reviewPackRoutes = document.getElementById("reviewPackRoutes");
const reviewPackSchema = document.getElementById("reviewPackSchema");
const reviewPackExport = document.getElementById("reviewPackExport");
const reviewPackPromises = document.getElementById("reviewPackPromises");
const reviewPackTwoMinuteReview = document.getElementById("reviewPackTwoMinuteReview");
const reviewPackBoundary = document.getElementById("reviewPackBoundary");
const reviewPackSequence = document.getElementById("reviewPackSequence");
const reviewPackProofAssets = document.getElementById("reviewPackProofAssets");
const reviewPackWatchouts = document.getElementById("reviewPackWatchouts");

const tasksBody = document.getElementById("tasksBody");
const taskSummary = document.getElementById("taskSummary");
const planStats = document.getElementById("planStats");
const planTimeline = document.getElementById("planTimeline");
const riskFill = document.getElementById("riskFill");
const riskLabel = document.getElementById("riskLabel");
const riskRationale = document.getElementById("riskRationale");
const riskDrivers = document.getElementById("riskDrivers");
const riskRecommendations = document.getElementById("riskRecommendations");
const whatIfSummary = document.getElementById("whatIfSummary");
const diagnosticsGrid = document.getElementById("diagnosticsGrid");
const diagnosticsAction = document.getElementById("diagnosticsAction");
let latestPlanRequest = null;

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readStartDate() {
  return startDateInput.value || undefined;
}

function readWhatIfBoost() {
  const parsed = Number.parseFloat(whatIfBoostInput.value || "1");
  return Math.min(4, Math.max(0.5, Number.isFinite(parsed) ? parsed : 1));
}

function syncWhatIfLabel() {
  whatIfBtn.textContent = `What-if +${readWhatIfBoost().toFixed(1)}h/day`;
}

function renderHourInputs() {
  hoursGrid.innerHTML = "";

  weekdays.forEach(([key, label]) => {
    const card = document.createElement("div");
    card.className = "hour-card";

    const title = document.createElement("label");
    title.textContent = label;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "12";
    input.step = "0.5";
    input.value = defaultHours[key];
    input.dataset.day = key;

    card.appendChild(title);
    card.appendChild(input);
    hoursGrid.appendChild(card);
  });
}

function readAvailability() {
  const values = {};
  hoursGrid.querySelectorAll("input").forEach((input) => {
    values[input.dataset.day] = Number.parseFloat(input.value || "0");
  });
  return values;
}

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#ff8fa1" : "#a7b2c9";
}

function renderBriefList(container, items) {
  container.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderStageContract(items) {
  briefStageContract.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.stage}: ${item.responsibility}`;
    briefStageContract.appendChild(li);
  });
}

function renderProofAssets(container, items) {
  container.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    const label = item.label || "Asset";
    const path = item.path || "";
    const why = item.why || "";
    li.textContent = why ? `${label} (${path}) — ${why}` : `${label} (${path})`;
    container.appendChild(li);
  });
}

async function loadRuntimeBrief() {
  try {
    const [healthResponse, briefResponse] = await Promise.all([
      fetch("/api/health"),
      fetch("/api/runtime/brief"),
    ]);

    if (!healthResponse.ok || !briefResponse.ok) {
      throw new Error(`HTTP ${Math.max(healthResponse.status, briefResponse.status)}`);
    }

    const health = await healthResponse.json();
    const brief = await briefResponse.json();
    const reportContract = brief.report_contract || {};

    briefBadge.classList.remove("warn");
    briefBadge.classList.add("ok");
    briefBadge.textContent = String(brief.status || "ok").toUpperCase();
    briefHeadline.textContent = brief.headline || "Runtime brief available.";
    briefSchema.textContent = reportContract.schema || "-";
    briefParserMode.textContent = health.diagnostics?.parser_mode || "-";
    briefCalendarReady.textContent = health.diagnostics?.calendar_export_ready ? "Ready" : "Check";
    briefRouteCount.textContent = `${(brief.routes || []).length} routes`;
    renderBriefList(briefReviewFlow, brief.review_flow || []);
    renderBriefList(briefTwoMinuteReview, brief.two_minute_review || []);
    renderBriefList(briefOperatorRules, reportContract.operator_rules || []);
    renderStageContract(brief.stage_contract || []);
    renderProofAssets(briefProofAssets, brief.proof_assets || []);
    renderBriefList(briefWatchouts, brief.watchouts || []);
  } catch (error) {
    briefBadge.classList.remove("ok");
    briefBadge.classList.add("warn");
    briefBadge.textContent = "ERROR";
    briefHeadline.textContent = "Runtime brief unavailable.";
    briefSchema.textContent = "-";
    briefParserMode.textContent = "-";
    briefCalendarReady.textContent = "-";
    briefRouteCount.textContent = "-";
    renderBriefList(briefReviewFlow, ["Open /api/health when the backend becomes available."]);
    renderBriefList(briefTwoMinuteReview, ["Open health, runtime brief, representative analyze flow, then export routes."]);
    renderBriefList(briefOperatorRules, ["No operator rules loaded."]);
    renderStageContract([]);
    renderProofAssets(briefProofAssets, []);
    renderBriefList(briefWatchouts, [`${error.message}`]);
  }
}

async function loadReviewPack() {
  try {
    const response = await fetch("/api/review-pack");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const pack = await response.json();
    const proofBundle = pack.proof_bundle || {};
    const analysisContract = pack.analysis_contract || {};

    reviewPackBadge.classList.remove("warn");
    reviewPackBadge.classList.add("ok");
    reviewPackBadge.textContent = String(pack.status || "ok").toUpperCase();
    reviewPackHeadline.textContent = pack.headline || "Review pack available.";
    reviewPackRuntime.textContent = proofBundle.parser_mode || "-";
    reviewPackRoutes.textContent = `${(proofBundle.review_routes || []).length} routes`;
    reviewPackSchema.textContent = analysisContract.schema || "-";
    reviewPackExport.textContent = proofBundle.calendar_export_ready ? "Ready" : "Check";
    renderBriefList(reviewPackPromises, pack.executive_promises || []);
    renderBriefList(reviewPackTwoMinuteReview, pack.two_minute_review || []);
    renderBriefList(reviewPackBoundary, pack.trust_boundary || []);
    renderBriefList(reviewPackSequence, pack.review_sequence || []);
    renderProofAssets(reviewPackProofAssets, pack.proof_assets || []);
    renderBriefList(reviewPackWatchouts, pack.watchouts || []);
  } catch (error) {
    reviewPackBadge.classList.remove("ok");
    reviewPackBadge.classList.add("warn");
    reviewPackBadge.textContent = "ERROR";
    reviewPackHeadline.textContent = "Review pack unavailable.";
    reviewPackRuntime.textContent = "-";
    reviewPackRoutes.textContent = "-";
    reviewPackSchema.textContent = "-";
    reviewPackExport.textContent = "-";
    renderBriefList(reviewPackPromises, ["Open /api/review-pack when the backend becomes available."]);
    renderBriefList(reviewPackTwoMinuteReview, ["Open health, runtime brief, analyze, what-if, then export routes."]);
    renderBriefList(reviewPackBoundary, []);
    renderBriefList(reviewPackSequence, []);
    renderProofAssets(reviewPackProofAssets, []);
    renderBriefList(reviewPackWatchouts, [`${error.message}`]);
  }
}

function renderTasks(tasks) {
  tasksBody.innerHTML = "";

  tasks.forEach((task) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.title}</td>
      <td>${task.task_type}</td>
      <td>${task.due_date}</td>
      <td>${task.estimated_hours.toFixed(1)}</td>
    `;
    tasksBody.appendChild(row);
  });

  const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
  taskSummary.textContent = `${tasks.length} tasks extracted | ${totalHours.toFixed(1)} required hours`;
}

function renderPlan(studyPlan) {
  const { items, utilization, total_required_hours, total_allocated_hours, unscheduled } = studyPlan;

  planStats.textContent = `Allocated ${total_allocated_hours.toFixed(1)}h / ${total_required_hours.toFixed(1)}h | Utilization ${(utilization * 100).toFixed(1)}%`;
  planTimeline.innerHTML = "";

  if (!items.length) {
    planTimeline.innerHTML = "<p class='muted'>No schedule generated.</p>";
    return;
  }

  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "timeline-item";
    el.innerHTML = `
      <strong>${item.task_title}</strong>
      <div class="timeline-meta">${item.date} · ${item.task_type}</div>
      <div>${item.hours.toFixed(1)} hour(s)</div>
    `;
    planTimeline.appendChild(el);
  });

  if (unscheduled.length) {
    const spill = document.createElement("div");
    spill.className = "timeline-item";
    spill.style.borderColor = "#b94a5d";
    const rows = unscheduled
      .map((entry) => `${entry.task_title}: ${entry.unscheduled_hours.toFixed(1)}h`)
      .join(" | ");
    spill.innerHTML = `<strong>Unscheduled Work</strong><div class='timeline-meta'>${rows}</div>`;
    planTimeline.appendChild(spill);
  }
}

function renderRisk(risk) {
  const percent = Math.round(risk.score * 100);
  riskFill.style.width = `${100 - percent}%`;
  riskLabel.textContent = `${risk.level.toUpperCase()} RISK · ${percent}%`;
  riskRationale.textContent = risk.rationale;

  riskDrivers.innerHTML = "";
  risk.top_drivers.forEach((driver) => {
    const li = document.createElement("li");
    li.textContent = `${driver.label}: ${driver.effect > 0 ? "+" : ""}${driver.effect}`;
    riskDrivers.appendChild(li);
  });

  riskRecommendations.innerHTML = "";
  (risk.recommendations || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    riskRecommendations.appendChild(li);
  });
}

function renderDiagnostics(diagnostics) {
  diagnosticsGrid.innerHTML = "";

  if (!diagnostics) {
    diagnosticsGrid.innerHTML =
      "<p class='muted'>Generate a plan to see pacing, buffer, and recovery diagnostics.</p>";
    diagnosticsAction.textContent = "No execution guidance yet.";
    return;
  }

  const cards = [
    ["Plan start", diagnostics.start_date],
    ["First deadline", diagnostics.first_due_date || "No dated deadlines"],
    ["Focus days", `${diagnostics.focus_days} day(s)`],
    [
      "Peak day",
      diagnostics.busiest_day
        ? `${diagnostics.busiest_day.date} · ${diagnostics.busiest_day.allocated_hours.toFixed(1)}h`
        : "No sessions yet",
    ],
    ["Deadline buffer", `${diagnostics.buffer_days_before_first_deadline} day(s)`],
    ["Unscheduled", `${diagnostics.total_unscheduled_hours.toFixed(1)}h`],
    ["Overdue tasks", `${diagnostics.overdue_tasks}`],
    [
      "Recovery boost",
      diagnostics.recommended_daily_boost_hours > 0
        ? `+${diagnostics.recommended_daily_boost_hours.toFixed(1)}h/day`
        : "Not needed",
    ],
  ];

  cards.forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "signal-card";
    card.innerHTML = `<span class="signal-label">${label}</span><strong>${value}</strong>`;
    diagnosticsGrid.appendChild(card);
  });

  diagnosticsAction.textContent = diagnostics.next_action;
}

async function downloadIcs() {
  if (!latestPlanRequest || !latestPlanRequest.tasks?.length) {
    setStatus("Generate a plan first to export calendar events.", true);
    return;
  }

  downloadIcsBtn.disabled = true;
  try {
    const response = await fetch("/api/export/ics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestPlanRequest),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();
    const blob = new Blob([content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "beaver-study-plan.ics";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("Calendar exported. Import the .ics into Google Calendar/Apple Calendar.");
  } catch (error) {
    setStatus(`Calendar export failed: ${error.message}`, true);
  } finally {
    downloadIcsBtn.disabled = false;
  }
}

async function runWhatIf() {
  if (!latestPlanRequest || !latestPlanRequest.tasks?.length) {
    setStatus("Generate a plan first before running a what-if simulation.", true);
    return;
  }

  whatIfBtn.disabled = true;
  try {
    const dailyBoost = readWhatIfBoost();
    const response = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...latestPlanRequest,
        daily_boost: dailyBoost,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const currentPct = Math.round(data.baseline.risk_score * 100);
    const boostedPct = Math.round(data.boosted.risk_score * 100);
    const improvementPp = Math.round(data.risk_reduction * 100);
    whatIfSummary.textContent =
      `Start ${data.start_date_used} · Current ${currentPct}% (${data.baseline.risk_level}) -> ` +
      `+${data.daily_boost.toFixed(1)}h/day ${boostedPct}% (${data.boosted.risk_level}), ` +
      `improvement ${improvementPp}pp, unscheduled ${data.baseline.unscheduled_hours.toFixed(1)}h -> ` +
      `${data.boosted.unscheduled_hours.toFixed(1)}h. ` +
      `${data.recommendation}`;
    setStatus("What-if simulation completed.");
  } catch (error) {
    setStatus(`What-if simulation failed: ${error.message}`, true);
  } finally {
    whatIfBtn.disabled = false;
  }
}

async function analyze() {
  const payload = {
    syllabus_text: syllabusText.value,
    availability: readAvailability(),
    start_date: readStartDate(),
  };

  if (!payload.syllabus_text || payload.syllabus_text.trim().length < 20) {
    setStatus("Please provide at least a short syllabus excerpt.", true);
    return;
  }

  analyzeBtn.disabled = true;
  setStatus("Analyzing syllabus and generating adaptive study plan...");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderTasks(data.extraction.tasks);
    renderPlan(data.plan.study_plan);
    renderRisk(data.plan.risk);
    renderDiagnostics(data.plan.diagnostics);
    latestPlanRequest = {
      tasks: data.extraction.tasks,
      availability: payload.availability,
      start_date: payload.start_date,
    };
    whatIfSummary.textContent = `Click 'What-if +${readWhatIfBoost().toFixed(1)}h/day' to simulate extra study capacity.`;
    whatIfBtn.disabled = data.extraction.tasks.length === 0;
    downloadIcsBtn.disabled = data.extraction.tasks.length === 0;

    if (data.extraction.tasks.length === 0) {
      setStatus(
        "No dated tasks were detected. Add lines with due dates like 'Project due March 21, 2026'.",
        true
      );
    } else if (data.extraction.discarded_lines.length) {
      setStatus(
        `Done. ${data.extraction.discarded_lines.length} lines were ignored because no valid due date was found.`
      );
    } else {
      setStatus("Done. Plan generated successfully.");
    }
  } catch (error) {
    latestPlanRequest = null;
    renderDiagnostics(null);
    whatIfSummary.textContent = "Run analysis first, then simulate extra daily capacity.";
    whatIfBtn.disabled = true;
    downloadIcsBtn.disabled = true;
    setStatus(`Analysis failed: ${error.message}`, true);
  } finally {
    analyzeBtn.disabled = false;
  }
}

loadSampleBtn.addEventListener("click", () => {
  syllabusText.value = sampleText;
  setStatus("Sample loaded. Click Generate Plan.");
});

resetHoursBtn.addEventListener("click", () => {
  renderHourInputs();
  setStatus("Availability reset to recommended defaults.");
});

analyzeBtn.addEventListener("click", analyze);
whatIfBtn.addEventListener("click", runWhatIf);
downloadIcsBtn.addEventListener("click", downloadIcs);
whatIfBoostInput.addEventListener("input", () => {
  syncWhatIfLabel();
  if (latestPlanRequest?.tasks?.length) {
    whatIfSummary.textContent = `Click 'What-if +${readWhatIfBoost().toFixed(1)}h/day' to simulate extra study capacity.`;
  }
});

renderHourInputs();
syllabusText.value = sampleText;
startDateInput.value = formatDateInputValue(new Date());
syncWhatIfLabel();
renderDiagnostics(null);
loadRuntimeBrief();
loadReviewPack();
setStatus("Ready. Update sample text or paste your own syllabus.");
