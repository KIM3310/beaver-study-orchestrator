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
const downloadIcsBtn = document.getElementById("downloadIcsBtn");
const statusText = document.getElementById("statusText");
const hoursGrid = document.getElementById("hoursGrid");
const startDateInput = document.getElementById("startDate");

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
    const response = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...latestPlanRequest,
        daily_boost: 1.0,
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
      `Current ${currentPct}% (${data.baseline.risk_level}) -> +1h/day ${boostedPct}% (${data.boosted.risk_level}), ` +
      `improvement ${improvementPp}pp, unscheduled ${data.baseline.unscheduled_hours.toFixed(1)}h -> ${data.boosted.unscheduled_hours.toFixed(1)}h. ` +
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
    latestPlanRequest = {
      tasks: data.extraction.tasks,
      availability: payload.availability,
      start_date: payload.start_date,
    };
    whatIfSummary.textContent = "Click 'What-if +1h/day' to simulate risk reduction from extra capacity.";
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
    whatIfSummary.textContent = "Run analysis first, then simulate +1h/day capacity.";
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

renderHourInputs();
syllabusText.value = sampleText;
startDateInput.value = formatDateInputValue(new Date());
setStatus("Ready. Update sample text or paste your own syllabus.");
