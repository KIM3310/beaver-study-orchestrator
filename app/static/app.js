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
const briefArchitectureFlow = document.getElementById("briefArchitectureFlow");
const briefTwoMinuteArchitecture = document.getElementById("briefTwoMinuteArchitecture");
const briefOperatorRules = document.getElementById("briefOperatorRules");
const briefStageContract = document.getElementById("briefStageContract");
const briefProofAssets = document.getElementById("briefProofAssets");
const briefWatchouts = document.getElementById("briefWatchouts");
const architecturePackBadge = document.getElementById("architecturePackBadge");
const architecturePackHeadline = document.getElementById("architecturePackHeadline");
const architecturePackRuntime = document.getElementById("architecturePackRuntime");
const architecturePackRoutes = document.getElementById("architecturePackRoutes");
const architecturePackSchema = document.getElementById("architecturePackSchema");
const architecturePackExport = document.getElementById("architecturePackExport");
const architecturePackPromises = document.getElementById("architecturePackPromises");
const architecturePackTwoMinuteArchitecture = document.getElementById("architecturePackTwoMinuteArchitecture");
const architecturePackBoundary = document.getElementById("architecturePackBoundary");
const architecturePackSequence = document.getElementById("architecturePackSequence");
const architecturePackProofAssets = document.getElementById("architecturePackProofAssets");
const architecturePackWatchouts = document.getElementById("architecturePackWatchouts");
const copyRuntimeBriefBtn = document.getElementById("copyRuntimeBriefBtn");
const copyArchitectureRoutesBtn = document.getElementById("copyArchitectureRoutesBtn");
const copyArchitecturePackBtn = document.getElementById("copyArchitecturePackBtn");
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
const diagnosticsGrid = document.getElementById("diagnosticsGrid");
const diagnosticsAction = document.getElementById("diagnosticsAction");
const historySummary = document.getElementById("historySummary");
const historyTimeline = document.getElementById("historyTimeline");
let latestPlanRequest = null;
let latestRuntimeBrief = null;
let latestArchitecturePack = null;
let latestRisk = null;
let latestDiagnostics = null;
let latestHistoryPayload = null;
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
    renderBriefList(briefArchitectureFlow, brief.architecture_flow || []);
    renderBriefList(briefTwoMinuteArchitecture, brief.two_minute_architecture || []);
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
    renderBriefList(briefArchitectureFlow, ["Open /api/health when the backend becomes available."]);
    renderBriefList(briefTwoMinuteArchitecture, ["Open health, runtime brief, representative analyze flow, then export routes."]);
    renderBriefList(briefOperatorRules, ["No operator rules loaded."]);
    renderStageContract([]);
    renderProofAssets(briefProofAssets, []);
    renderBriefList(briefWatchouts, [`${error.message}`]);
  }
}

async function loadArchitecturePack() {
  try {
    const response = await fetch("/api/architecture-pack");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const pack = await response.json();
    latestArchitecturePack = pack;
    const proofBundle = pack.proof_bundle || {};
    const analysisContract = pack.analysis_contract || {};

    architecturePackBadge.classList.remove("warn");
    architecturePackBadge.classList.add("ok");
    architecturePackBadge.textContent = String(pack.status || "ok").toUpperCase();
    architecturePackHeadline.textContent = pack.headline || "Architecture pack available.";
    architecturePackRuntime.textContent = proofBundle.parser_mode || "-";
    architecturePackRoutes.textContent = `${(proofBundle.architecture_routes || []).length} routes`;
    architecturePackSchema.textContent = analysisContract.schema || "-";
    architecturePackExport.textContent = proofBundle.calendar_export_ready ? "Ready" : "Check";
    renderBriefList(architecturePackPromises, pack.executive_promises || []);
    renderBriefList(architecturePackTwoMinuteArchitecture, pack.two_minute_architecture || []);
    renderBriefList(architecturePackBoundary, pack.trust_boundary || []);
    renderBriefList(architecturePackSequence, pack.architecture_sequence || []);
    renderProofAssets(architecturePackProofAssets, pack.proof_assets || []);
    renderBriefList(architecturePackWatchouts, pack.watchouts || []);
  } catch (error) {
    architecturePackBadge.classList.remove("ok");
    architecturePackBadge.classList.add("warn");
    architecturePackBadge.textContent = "ERROR";
    architecturePackHeadline.textContent = "Architecture pack unavailable.";
    architecturePackRuntime.textContent = "-";
    architecturePackRoutes.textContent = "-";
    architecturePackSchema.textContent = "-";
    architecturePackExport.textContent = "-";
    renderBriefList(architecturePackPromises, ["Open /api/architecture-pack when the backend becomes available."]);
    renderBriefList(architecturePackTwoMinuteArchitecture, ["Open health, runtime brief, analyze, what-if, then export routes."]);
    renderBriefList(architecturePackBoundary, []);
    renderBriefList(architecturePackSequence, []);
    renderProofAssets(architecturePackProofAssets, []);
    renderBriefList(architecturePackWatchouts, [`${error.message}`]);
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
    "2-minute architecture path",
    ...((brief.two_minute_architecture || []).map((item) => `- ${item}`)),
  ];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Runtime brief copied.");
  } catch {
    setStatus("Runtime brief copy failed.", true);
  }
}

async function handleCopyArchitecturePack() {
  const pack = latestArchitecturePack || {};
  const lines = [
    "beaver-study summary",
    `Headline: ${pack.headline || architecturePackHeadline.textContent || "-"}`,
    `Runtime: ${architecturePackRuntime.textContent || "-"}`,
    `Schema: ${architecturePackSchema.textContent || "-"}`,
    `Export: ${architecturePackExport.textContent || "-"}`,
    "",
    "Architecture sequence",
    ...((pack.architecture_sequence || []).map((item) => `- ${item}`)),
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
    setStatus("Architecture pack copied.");
  } catch {
    setStatus("Architecture pack copy failed.", true);
  }
}

async function handleCopyArchitectureRoutes() {
  const pack = latestArchitecturePack || {};
  const routes = pack.proof_bundle?.architecture_routes || [];
  const lines = ["beaver-study architecture routes", ...routes.map((item) => `- ${item}`)];

  try {
    await copyTextToClipboard(lines.join("\n"));
    setStatus("Architecture routes copied.");
  } catch {
    setStatus("Architecture routes copy failed.", true);
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
    `Schema: ${briefSchema.textContent || architecturePackSchema.textContent || "-"}`,
    `Calendar export: ${architecturePackExport.textContent || briefCalendarReady.textContent || "-"}`,
    `Risk: ${latestRisk ? `${latestRisk.level.toUpperCase()} ${riskPct}%` : riskLabel.textContent || "-"}`,
    `Next action: ${latestDiagnostics.next_action || diagnosticsAction.textContent || "-"}`,
    `What-if: ${whatIfSummary.textContent || "not simulated"}`,
    "",
    "Focused routes",
    ...((latestArchitecturePack?.proof_bundle?.architecture_routes || []).slice(0, 4).map((item) => `- ${item}`)),
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
    loadRecentHistory();
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
copyRuntimeBriefBtn.addEventListener("click", handleCopyRuntimeBrief);
copyArchitectureRoutesBtn.addEventListener("click", handleCopyArchitectureRoutes);
copyArchitecturePackBtn.addEventListener("click", handleCopyArchitecturePack);
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
loadRecentHistory();
loadRuntimeBrief();
loadArchitecturePack();
updateReviewViewUrl();
setStatus("Ready. Update sample text or paste your own syllabus.");
