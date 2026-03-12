function formatSampleDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildSampleText() {
  const today = new Date();
  const milestones = [
    ["Homework 1 due", 7],
    ["Lab 2 due", 12],
    ["Team Project Proposal due", 17],
    ["Midterm Exam on", 23],
    ["Assignment 3 due", 32],
    ["Group Project Milestone due", 40],
    ["Final Presentation due", 48],
    ["Final Exam", 52],
  ];
  const lines = milestones.map(([label, dayOffset]) => {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    return `${label} ${formatSampleDate(date)}`;
  });
  return ["CS 499 - Product Engineering", ...lines].join("\n");
}

const sampleText = buildSampleText();

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
const recoverBtn = document.getElementById("recoverBtn");
const whatIfBoostInput = document.getElementById("whatIfBoost");
const missedDaysInput = document.getElementById("missedDays");
const downloadIcsBtn = document.getElementById("downloadIcsBtn");
const copyCurrentViewBtn = document.getElementById("copyCurrentViewBtn");
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
const copyRuntimeBriefBtn = document.getElementById("copyRuntimeBriefBtn");
const copyReviewRoutesBtn = document.getElementById("copyReviewRoutesBtn");
const copyReviewPackBtn = document.getElementById("copyReviewPackBtn");
const copyDiagnosticsBtn = document.getElementById("copyDiagnosticsBtn");
const copyExecutionSnapshotBtn = document.getElementById("copyExecutionSnapshotBtn");

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
const recoverySummary = document.getElementById("recoverySummary");
const diagnosticsGrid = document.getElementById("diagnosticsGrid");
const diagnosticsAction = document.getElementById("diagnosticsAction");
const historySummary = document.getElementById("historySummary");
const historyTimeline = document.getElementById("historyTimeline");
let latestPlanRequest = null;
let latestRuntimeBrief = null;
let latestReviewPack = null;
let latestRisk = null;
let latestDiagnostics = null;
let latestHistoryPayload = null;
const RECORDED_REVIEW = {
  runtimeBrief: {
    status: "recorded-review",
    headline: "Recorded runtime brief for the fastest recruiter walkthrough.",
    report_contract: {
      schema: "beaver-study-plan-v1",
      operator_rules: [
        "Review risk first, then study schedule, then calendar export.",
        "Treat what-if and recovery plans as decision aids, not cosmetic extras.",
        "Keep spillover and overdue work visible before calling the plan safe.",
      ],
    },
    routes: ["/api/health", "/api/runtime/brief", "/api/review-pack", "/api/export/ics"],
    two_minute_review: [
      "Load the sample syllabus and skim the risk meter first.",
      "Read the study plan plus diagnostics before opening export.",
      "Use what-if and missed-session recovery to show adaptation, not just planning.",
    ],
    review_flow: [
      "Confirm runtime brief and review pack before demoing analysis.",
      "Generate one representative plan and inspect deadline risk.",
      "Only talk about export after the plan, risk, and diagnostics agree.",
    ],
    stage_contract: [
      { stage: "parse", responsibility: "Turn raw syllabus text into tasks and dated milestones." },
      { stage: "plan", responsibility: "Allocate study hours across the calendar with visible spillover." },
      { stage: "recover", responsibility: "Replan around missed sessions without hiding risk." },
    ],
    proof_assets: [
      { label: "Runtime Brief", path: "/api/runtime/brief", why: "Pins the planning contract and review routes." },
      { label: "Review Pack", path: "/api/review-pack", why: "Packages promises, trust boundary, and export posture." },
      { label: "ICS Export", path: "/api/export/ics", why: "Shows the downstream calendar artifact once the plan is trustworthy." },
    ],
    watchouts: [
      "Recorded mode proves the workflow shape, not live parsing latency.",
      "A recovery plan is only credible when the risk meter still stays visible.",
    ],
  },
  reviewPack: {
    status: "recorded-review",
    headline: "Recorded reviewer contract for study-plan risk, adaptation, and export posture.",
    proof_bundle: {
      parser_mode: "recorded-demo",
      review_routes: ["/api/health", "/api/runtime/brief", "/api/review-pack", "/api/export/ics"],
      calendar_export_ready: true,
    },
    analysis_contract: {
      schema: "beaver-study-plan-v1",
    },
    executive_promises: [
      "One input turns into tasks, schedule, risk drivers, and a calendar artifact.",
      "What-if and missed-session recovery stay in the same story, so replanning feels intentional.",
    ],
    two_minute_review: [
      "Load sample -> generate plan -> read risk -> test what-if -> review export.",
      "Keep diagnostics and buffer days visible while explaining the schedule.",
    ],
    trust_boundary: [
      "This surface is a planning and review tool, not a calendar system of record.",
      "Exports should follow the reviewed schedule, not replace the planning proof.",
    ],
    review_sequence: [
      "Runtime brief -> generated plan -> risk drivers -> what-if -> recovery -> calendar export.",
    ],
    proof_assets: [
      { label: "Runtime Brief", path: "/api/runtime/brief", why: "Locks the operator contract." },
      { label: "Review Pack", path: "/api/review-pack", why: "Packages the recruiter-facing proof path." },
      { label: "ICS Export", path: "/api/export/ics", why: "Shows the final artifact after review." },
    ],
    watchouts: [
      "Recorded mode is best for first-pass review when the backend is not running.",
    ],
  },
};
const initialViewParams = new URLSearchParams(window.location.search);

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

function readMissedDays() {
  const parsed = Number.parseInt(missedDaysInput.value || "2", 10);
  return Math.min(14, Math.max(1, Number.isFinite(parsed) ? parsed : 2));
}

function syncWhatIfLabel() {
  whatIfBtn.textContent = `What-if +${readWhatIfBoost().toFixed(1)}h/day`;
}

function updateReviewViewUrl() {
  const params = new URLSearchParams(window.location.search);
  if (startDateInput.value) params.set("start", startDateInput.value);
  else params.delete("start");
  params.set("boost", readWhatIfBoost().toFixed(1));
  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

async function copyCurrentViewLink() {
  updateReviewViewUrl();
  try {
    await copyTextToClipboard(window.location.href);
    setStatus("Current review link copied.");
  } catch {
    setStatus("Current review link copy failed.", true);
  }
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

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "true");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
  return true;
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
    latestRuntimeBrief = brief;
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
    const brief = RECORDED_REVIEW.runtimeBrief;
    latestRuntimeBrief = brief;
    const reportContract = brief.report_contract || {};
    briefBadge.classList.remove("warn");
    briefBadge.classList.add("ok");
    briefBadge.textContent = "RECORDED";
    briefHeadline.textContent = brief.headline;
    briefSchema.textContent = reportContract.schema || "-";
    briefParserMode.textContent = "recorded-demo";
    briefCalendarReady.textContent = "Ready";
    briefRouteCount.textContent = `${(brief.routes || []).length} routes`;
    renderBriefList(briefReviewFlow, brief.review_flow || []);
    renderBriefList(briefTwoMinuteReview, brief.two_minute_review || []);
    renderBriefList(briefOperatorRules, reportContract.operator_rules || []);
    renderStageContract(brief.stage_contract || []);
    renderProofAssets(briefProofAssets, brief.proof_assets || []);
    renderBriefList(briefWatchouts, brief.watchouts || []);
  }
}

async function loadReviewPack() {
  try {
    const response = await fetch("/api/review-pack");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const pack = await response.json();
    latestReviewPack = pack;
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
    const pack = RECORDED_REVIEW.reviewPack;
    latestReviewPack = pack;
    const proofBundle = pack.proof_bundle || {};
    const analysisContract = pack.analysis_contract || {};
    reviewPackBadge.classList.remove("warn");
    reviewPackBadge.classList.add("ok");
    reviewPackBadge.textContent = "RECORDED";
    reviewPackHeadline.textContent = pack.headline;
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
  }
}

async function handleCopyRuntimeBrief() {
  const brief = latestRuntimeBrief || {};
  const lines = [
    "beaver-study runtime brief",
    `Headline: ${brief.headline || briefHeadline.textContent || "-"}`,
    `Schema: ${brief.report_contract?.schema || briefSchema.textContent || "-"}`,
    `Parser mode: ${briefParserMode.textContent || "-"}`,
    `Calendar export: ${briefCalendarReady.textContent || "-"}`,
    "",
    "2-minute review",
    ...((brief.two_minute_review || []).map((item) => `- ${item}`)),
  ];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Runtime brief copied.");
  } catch {
    setStatus("Runtime brief copy failed.", true);
  }
}

async function handleCopyReviewPack() {
  const pack = latestReviewPack || {};
  const lines = [
    "beaver-study review pack",
    `Headline: ${pack.headline || reviewPackHeadline.textContent || "-"}`,
    `Runtime: ${reviewPackRuntime.textContent || "-"}`,
    `Schema: ${reviewPackSchema.textContent || "-"}`,
    `Export: ${reviewPackExport.textContent || "-"}`,
    "",
    "Review sequence",
    ...((pack.review_sequence || []).map((item) => `- ${item}`)),
    "",
    "Proof assets",
    ...((pack.proof_assets || []).map((item) => {
      const label = item.label || "Asset";
      const path = item.path || "-";
      const why = item.why || "";
      return why ? `- ${label}: ${path} - ${why}` : `- ${label}: ${path}`;
    })),
  ];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Review pack copied.");
  } catch {
    setStatus("Review pack copy failed.", true);
  }
}

async function handleCopyReviewRoutes() {
  const pack = latestReviewPack || {};
  const routes = pack.proof_bundle?.review_routes || [];
  const lines = ["beaver-study review routes", ...routes.map((item) => `- ${item}`)];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Review routes copied.");
  } catch {
    setStatus("Review routes copy failed.", true);
  }
}

async function handleCopyDiagnostics() {
  if (!latestDiagnostics) {
    setStatus("Generate a plan first to copy diagnostics.", true);
    return;
  }

  const riskPct = latestRisk ? Math.round(latestRisk.score * 100) : null;
  const lines = [
    "beaver-study diagnostics snapshot",
    `Tasks: ${latestPlanRequest?.tasks?.length || 0}`,
    `Plan start: ${latestDiagnostics.start_date || "-"}`,
    `First deadline: ${latestDiagnostics.first_due_date || "No dated deadlines"}`,
    `Focus days: ${latestDiagnostics.focus_days || 0}`,
    `Peak day: ${
      latestDiagnostics.busiest_day
        ? `${latestDiagnostics.busiest_day.date} · ${latestDiagnostics.busiest_day.allocated_hours.toFixed(1)}h`
        : "No sessions yet"
    }`,
    `Deadline buffer: ${latestDiagnostics.buffer_days_before_first_deadline || 0} day(s)`,
    `Unscheduled: ${(latestDiagnostics.total_unscheduled_hours || 0).toFixed(1)}h`,
    `Overdue: ${latestDiagnostics.overdue_tasks || 0}`,
    `Recovery boost: ${
      latestDiagnostics.recommended_daily_boost_hours > 0
        ? `+${latestDiagnostics.recommended_daily_boost_hours.toFixed(1)}h/day`
        : "Not needed"
    }`,
    `Risk: ${
      latestRisk ? `${latestRisk.level.toUpperCase()} ${riskPct}%` : riskLabel.textContent || "-"
    }`,
    `Rationale: ${latestRisk?.rationale || riskRationale.textContent || "-"}`,
    "",
    "Top drivers",
    ...((latestRisk?.top_drivers || []).map(
      (driver) => `- ${driver.label}: ${driver.effect > 0 ? "+" : ""}${driver.effect}`
    )),
    "",
    "Next action",
    `- ${latestDiagnostics.next_action || diagnosticsAction.textContent || "-"}`,
  ];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Diagnostics copied.");
  } catch {
    setStatus("Diagnostics copy failed.", true);
  }
}

async function handleCopyExecutionSnapshot() {
  if (!latestPlanRequest || !latestDiagnostics) {
    setStatus("Generate a plan first to copy an execution snapshot.", true);
    return;
  }

  const riskPct = latestRisk ? Math.round(latestRisk.score * 100) : null;
  const lines = [
    "beaver-study execution snapshot",
    `Task count: ${latestPlanRequest.tasks?.length || 0}`,
    `Plan start: ${latestDiagnostics.start_date || readStartDate() || "-"}`,
    `Parser mode: ${briefParserMode.textContent || "-"}`,
    `Schema: ${briefSchema.textContent || reviewPackSchema.textContent || "-"}`,
    `Calendar export: ${reviewPackExport.textContent || briefCalendarReady.textContent || "-"}`,
    `Risk: ${latestRisk ? `${latestRisk.level.toUpperCase()} ${riskPct}%` : riskLabel.textContent || "-"}`,
    `Next action: ${latestDiagnostics.next_action || diagnosticsAction.textContent || "-"}`,
    `What-if: ${whatIfSummary.textContent || "not simulated"}`,
    "",
    "Focused routes",
    ...((latestReviewPack?.proof_bundle?.review_routes || []).slice(0, 4).map((item) => `- ${item}`)),
  ];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Execution snapshot copied.");
  } catch {
    setStatus("Execution snapshot copy failed.", true);
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
  latestRisk = risk || null;
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
  latestDiagnostics = diagnostics || null;
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

async function loadRecentHistory() {
  try {
    const response = await fetch("/api/history/recent?limit=6");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const items = payload.items || [];
    latestHistoryPayload = payload;
    historyTimeline.innerHTML = "";

    if (!items.length) {
      historySummary.textContent = "Recent plan attempts will appear here after analysis runs.";
      historyTimeline.innerHTML = "<p class='muted'>No recent analyses have been recorded yet.</p>";
      return;
    }

    const highRiskCount = items.filter((item) => item.risk_level === "high").length;
    const spilloverCount = items.filter((item) => Number(item.unscheduled_hours || 0) > 0).length;
    historySummary.textContent = `${items.length} recent analyses loaded | ${highRiskCount} high-risk | ${spilloverCount} with spillover`;

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "timeline-item";
      const riskPct = Math.round((Number(item.risk_score) || 0) * 100);
      const firstDue = item.first_due_date || "No dated deadlines";
      card.innerHTML = `
        <strong>${item.headline}</strong>
        <div class="timeline-meta">${item.created_at} · ${item.task_count} task(s) · ${item.risk_level.toUpperCase()} ${riskPct}%</div>
        <div>Start ${item.start_date} · First due ${firstDue} · Focus ${item.focus_days} day(s) · Unscheduled ${Number(item.unscheduled_hours || 0).toFixed(1)}h</div>
        <div class="timeline-meta">${item.next_action}</div>
      `;
      historyTimeline.appendChild(card);
    });
  } catch (error) {
    latestHistoryPayload = null;
    historySummary.textContent = "Recent analyses unavailable.";
    historyTimeline.innerHTML = `<p class='muted'>${error.message}</p>`;
  }
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

async function runRecovery() {
  if (!latestPlanRequest || !latestPlanRequest.tasks?.length) {
    setStatus("Generate a plan first before running recovery replanning.", true);
    return;
  }

  recoverBtn.disabled = true;
  try {
    const missedDays = readMissedDays();
    const start = latestPlanRequest.start_date || readStartDate();
    const startDate = start ? new Date(start) : new Date();
    const missedDates = Array.from({ length: missedDays }, (_, index) => {
      const next = new Date(startDate);
      next.setDate(startDate.getDate() + index + 1);
      return formatDateInputValue(next);
    });

    const response = await fetch("/api/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks: latestPlanRequest.tasks,
        availability: latestPlanRequest.availability,
        start_date: start,
        missed_dates: missedDates,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const baselinePct = Math.round(data.baseline.risk_score * 100);
    const recoveredPct = Math.round(data.recovered.risk_score * 100);
    recoverySummary.textContent =
      `${data.missed_dates.length} missed day(s) -> recovery start ${data.recovered.start_date}. ` +
      `Risk ${baselinePct}% (${data.baseline.risk_level}) -> ${recoveredPct}% (${data.recovered.risk_level}), ` +
      `missed-session hours ${Number(data.delta.missed_session_hours || 0).toFixed(1)}h, ` +
      `auto recovery +${Number(data.auto_recovery_hours || 0).toFixed(1)}h/day. ${data.recommendation}`;
    setStatus("Recovery replan completed.");
  } catch (error) {
    setStatus(`Recovery replan failed: ${error.message}`, true);
  } finally {
    recoverBtn.disabled = false;
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
    recoverySummary.textContent = `Click 'Recover Missed Sessions' to replan after ${readMissedDays()} missed day(s).`;
    whatIfBtn.disabled = data.extraction.tasks.length === 0;
    recoverBtn.disabled = data.extraction.tasks.length === 0;
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
    loadRecentHistory();
  } catch (error) {
    latestPlanRequest = null;
    renderDiagnostics(null);
    whatIfSummary.textContent = "Run analysis first, then simulate extra daily capacity.";
    whatIfBtn.disabled = true;
    recoverySummary.textContent = "Generate a plan first, then replan after missed study days.";
    recoverBtn.disabled = true;
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
recoverBtn.addEventListener("click", runRecovery);
downloadIcsBtn.addEventListener("click", downloadIcs);
copyRuntimeBriefBtn.addEventListener("click", handleCopyRuntimeBrief);
copyReviewRoutesBtn.addEventListener("click", handleCopyReviewRoutes);
copyReviewPackBtn.addEventListener("click", handleCopyReviewPack);
copyDiagnosticsBtn.addEventListener("click", handleCopyDiagnostics);
copyExecutionSnapshotBtn.addEventListener("click", handleCopyExecutionSnapshot);
copyCurrentViewBtn.addEventListener("click", copyCurrentViewLink);
whatIfBoostInput.addEventListener("input", () => {
  syncWhatIfLabel();
  updateReviewViewUrl();
  if (latestPlanRequest?.tasks?.length) {
    whatIfSummary.textContent = `Click 'What-if +${readWhatIfBoost().toFixed(1)}h/day' to simulate extra study capacity.`;
  }
});
startDateInput.addEventListener("change", updateReviewViewUrl);

renderHourInputs();
syllabusText.value = sampleText;
startDateInput.value = initialViewParams.get("start") || formatDateInputValue(new Date());
if (initialViewParams.get("boost")) {
  whatIfBoostInput.value = initialViewParams.get("boost");
}
syncWhatIfLabel();
renderDiagnostics(null);
recoverBtn.disabled = true;
loadRecentHistory();
loadRuntimeBrief();
loadReviewPack();
updateReviewViewUrl();
setStatus("Ready. Update sample text or paste your own syllabus.");
