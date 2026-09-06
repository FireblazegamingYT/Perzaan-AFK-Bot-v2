const mineflayer = require('mineflayer');
const { Movements, pathfinder, goals } = require('mineflayer-pathfinder');
const { GoalBlock } = goals;
const config = require('./settings.json');
const express = require('express');
const http = require('http');

// ============================================================
// EXPRESS SERVER - Keep Render/Aternos alive
// ============================================================
const app = express();
const PORT = process.env.PORT || 5000;

// Bot state tracking
let botState = {
  connected: false,
  lastActivity: Date.now(),
  reconnectAttempts: 0,
  startTime: Date.now(),
  errors: []
};

// Health check endpoint for monitoring
// Health check endpoint for monitoring
app.get('/', (req, res) => {
  // "Blue Teal Shadow" Theme - Live Dashboard
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.name} • Live Status</title>

<style>
* {
  box-sizing: border-box;
}

:root {
  --bg: #020617;
  --panel: rgba(15, 23, 42, .78);
  --panel2: rgba(2, 6, 23, .72);
  --border: rgba(148, 163, 184, .14);

  --cyan: #22d3ee;
  --teal: #2dd4bf;
  --green: #4ade80;
  --red: #fb7185;
  --yellow: #facc15;
  --purple: #a78bfa;

  --text: #f8fafc;
  --muted: #94a3b8;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;

  font-family:
    "Segoe UI",
    Inter,
    system-ui,
    sans-serif;

  color: var(--text);

  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(45, 212, 191, .15),
      transparent 28%
    ),
    radial-gradient(
      circle at 90% 20%,
      rgba(34, 211, 238, .13),
      transparent 28%
    ),
    radial-gradient(
      circle at 50% 100%,
      rgba(139, 92, 246, .13),
      transparent 35%
    ),
    var(--bg);

  overflow-x: hidden;
}

/* Background */

.bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: .12;
  animation: float 12s ease-in-out infinite;
}

.orb1 {
  width: 320px;
  height: 320px;
  background: var(--teal);
  top: -150px;
  left: -100px;
}

.orb2 {
  width: 280px;
  height: 280px;
  background: var(--purple);
  right: -120px;
  top: 35%;
  animation-delay: 3s;
}

.orb3 {
  width: 240px;
  height: 240px;
  background: var(--cyan);
  bottom: -130px;
  left: 40%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(25px, -30px) scale(1.12);
  }
}

/* Layout */

.wrapper {
  width: 100%;
  max-width: 1050px;
  margin: auto;
  padding: 25px 18px 45px;
}

/* Navbar */

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand-icon {
  width: 45px;
  height: 45px;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      rgba(45, 212, 191, .18),
      rgba(34, 211, 238, .08)
    );

  border: 1px solid rgba(45, 212, 191, .2);

  font-size: 21px;
}

.brand-name {
  font-weight: 800;
  font-size: 15px;
}

.brand-sub {
  font-size: 10px;
  color: var(--muted);
  margin-top: 2px;
}

.refresh {
  width: 43px;
  height: 43px;

  border-radius: 13px;

  border: 1px solid var(--border);

  background: rgba(15, 23, 42, .7);

  color: white;

  font-size: 20px;

  cursor: pointer;

  transition: .25s;
}

.refresh:hover {
  border-color: var(--teal);
  background: rgba(45, 212, 191, .1);
}

.refresh.spin {
  animation: rotate .45s ease;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

/* Hero */

.hero {
  position: relative;

  padding: 30px 20px;

  text-align: center;

  background: var(--panel);

  border: 1px solid var(--border);

  border-radius: 26px;

  backdrop-filter: blur(22px);

  box-shadow:
    0 25px 80px rgba(0, 0, 0, .35);

  overflow: hidden;
}

.hero::before {
  content: "";

  position: absolute;

  width: 350px;
  height: 350px;

  top: -260px;
  left: 50%;

  transform: translateX(-50%);

  background: var(--teal);

  filter: blur(100px);

  opacity: .08;
}

.server-icon {
  width: 76px;
  height: 76px;

  margin: auto;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 22px;

  font-size: 34px;

  background:
    linear-gradient(
      135deg,
      rgba(45, 212, 191, .17),
      rgba(34, 211, 238, .07)
    );

  border: 1px solid rgba(45, 212, 191, .2);

  box-shadow:
    0 0 35px rgba(45, 212, 191, .13);

  animation: serverFloat 4s ease-in-out infinite;
}

@keyframes serverFloat {
  50% {
    transform: translateY(-6px);
  }
}

.hero h1 {
  margin: 16px 0 5px;

  font-size: clamp(27px, 5vw, 42px);

  font-weight: 900;

  background:
    linear-gradient(
      90deg,
      var(--teal),
      var(--cyan),
      var(--purple)
    );

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  color: var(--muted);
  font-size: 12px;
}

/* Status ring */

.status-ring {
  position: relative;

  width: 130px;
  height: 130px;

  margin: 24px auto 12px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.status-ring::before {
  content: "";

  position: absolute;
  inset: 0;

  border-radius: 50%;

  border: 2px solid rgba(74, 222, 128, .15);
}

.status-ring::after {
  content: "";

  position: absolute;
  inset: 9px;

  border-radius: 50%;

  border: 1px dashed rgba(74, 222, 128, .28);

  animation: spin 8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status-core {
  width: 91px;
  height: 91px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: rgba(74, 222, 128, .07);

  border: 1px solid rgba(74, 222, 128, .25);

  box-shadow:
    0 0 35px rgba(74, 222, 128, .14);
}

.status-dot {
  width: 12px;
  height: 12px;

  border-radius: 50%;

  background: var(--green);

  box-shadow:
    0 0 16px var(--green);

  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  50% {
    transform: scale(1.4);
    opacity: .5;
  }
}

.status-label {
  margin-top: 8px;

  font-size: 10px;
  font-weight: 900;

  letter-spacing: 1px;

  color: var(--green);
}

#status-description {
  color: var(--muted);
  font-size: 12px;
}

/* Cards */

.stats {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 13px;

  margin-top: 17px;
}

.card {
  position: relative;

  padding: 18px;

  min-height: 125px;

  border-radius: 17px;

  background: var(--panel);

  border: 1px solid var(--border);

  backdrop-filter: blur(18px);

  transition:
    transform .25s,
    border-color .25s,
    box-shadow .25s;

  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);

  border-color:
    rgba(45, 212, 191, .3);

  box-shadow:
    0 15px 35px rgba(0, 0, 0, .25);
}

.card::after {
  content: "";

  position: absolute;

  width: 90px;
  height: 90px;

  right: -45px;
  bottom: -45px;

  background: var(--teal);

  filter: blur(45px);

  opacity: .06;
}

.card-icon {
  font-size: 21px;
  margin-bottom: 12px;
}

.card-label {
  color: var(--muted);

  font-size: 9px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: 1px;
}

.card-value {
  margin-top: 5px;

  font-size: 16px;

  font-weight: 800;

  word-break: break-word;
}

.green {
  color: var(--green);
}

.cyan {
  color: var(--cyan);
}

.yellow {
  color: var(--yellow);
}

.red {
  color: var(--red);
}

/* Server panel */

.panel {
  margin-top: 17px;

  padding: 21px;

  border-radius: 20px;

  background: var(--panel);

  border: 1px solid var(--border);

  backdrop-filter: blur(18px);
}

.panel-header {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 15px;
}

.panel-title {
  font-size: 14px;
  font-weight: 800;
}

.badge {
  padding: 5px 9px;

  border-radius: 999px;

  font-size: 9px;

  font-weight: 800;

  color: var(--green);

  background: rgba(74, 222, 128, .08);

  border: 1px solid rgba(74, 222, 128, .15);
}

.info-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 9px;
}

.info {
  padding: 13px;

  border-radius: 12px;

  background: rgba(2, 6, 23, .48);

  border: 1px solid var(--border);
}

.info small {
  display: block;

  color: var(--muted);

  font-size: 9px;

  margin-bottom: 4px;
}

.info span {
  font-size: 12px;
  font-weight: 700;
}

/* Buttons */

.actions {
  display: flex;

  gap: 10px;

  margin-top: 15px;
}

.btn {
  flex: 1;

  padding: 12px;

  border-radius: 12px;

  border: 1px solid var(--border);

  background: rgba(15, 23, 42, .7);

  color: white;

  text-decoration: none;

  text-align: center;

  font-size: 12px;

  font-weight: 800;

  cursor: pointer;

  transition: .25s;
}

.btn:hover {
  transform: translateY(-2px);

  border-color: var(--teal);
}

.btn-primary {
  border: none;

  color: #022c22;

  background:
    linear-gradient(
      135deg,
      var(--teal),
      var(--cyan)
    );

  box-shadow:
    0 8px 25px rgba(45, 212, 191, .18);
}

/* Connection */

.connection {
  margin-top: 16px;

  padding: 16px 18px;

  border-radius: 15px;

  background: rgba(2, 6, 23, .5);

  border: 1px solid var(--border);
}

.connection-top {
  display: flex;

  justify-content: space-between;

  margin-bottom: 8px;

  color: var(--muted);

  font-size: 9px;

  font-weight: 800;

  letter-spacing: .8px;
}

.connection-bar {
  height: 5px;

  background: #1e293b;

  border-radius: 999px;

  overflow: hidden;
}

.connection-fill {
  height: 100%;
  width: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      var(--teal),
      var(--cyan),
      var(--purple)
    );

  animation: connection 2s linear infinite;
}

@keyframes connection {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

/* Footer */

footer {
  text-align: center;

  margin-top: 20px;

  color: #64748b;

  font-size: 10px;
}

footer strong {
  color: #94a3b8;
}

/* Toast */

.toast {
  position: fixed;

  left: 50%;
  bottom: 22px;

  transform: translate(-50%, 90px);

  padding: 11px 16px;

  border-radius: 12px;

  background: #0f172a;

  border: 1px solid var(--border);

  color: #e2e8f0;

  font-size: 11px;

  box-shadow:
    0 15px 40px rgba(0, 0, 0, .4);

  transition: .3s;

  z-index: 999;
}

.toast.show {
  transform: translate(-50%, 0);
}

/* Responsive */

@media(max-width: 850px) {
  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media(max-width: 520px) {
  .wrapper {
    padding: 14px 10px 35px;
  }

  .hero {
    padding: 24px 14px;
  }

  .stats {
    gap: 9px;
  }

  .card {
    min-height: 115px;
    padding: 14px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
</head>

<body>

<div class="bg">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>
</div>

<div class="wrapper">

  <!-- NAV -->

  <div class="nav">

    <div class="brand">

      <div class="brand-icon">
        ⚡
      </div>

      <div>
        <div class="brand-name">
          ${config.name}
        </div>

        <div class="brand-sub">
          Live Control Center
        </div>
      </div>

    </div>

    <button
      class="refresh"
      id="refresh-btn"
      onclick="manualRefresh()">

      ↻

    </button>

  </div>


  <!-- HERO -->

  <section class="hero">

    <div class="server-icon">
      🖥️
    </div>

    <h1>
      ${config.name}
    </h1>

    <div class="hero-description">
      Real-time server & bot monitoring
    </div>


    <div class="status-ring">

      <div class="status-core">

        <div
          class="status-dot"
          id="status-dot">
        </div>

        <div
          class="status-label"
          id="status-label">

          CONNECTING

        </div>

      </div>

    </div>


    <div id="status-description">
      Checking server connection...
    </div>

  </section>


  <!-- STATS -->

  <section class="stats">


    <div class="card">

      <div class="card-icon">
        ⚡
      </div>

      <div class="card-label">
        Status
      </div>

      <div
        class="card-value green"
        id="status-text">

        Connecting...

      </div>

    </div>


    <div class="card">

      <div class="card-icon">
        ⏱️
      </div>

      <div class="card-label">
        Uptime
      </div>

      <div
        class="card-value cyan"
        id="uptime-text">

        0h 0m 0s

      </div>

    </div>


    <div class="card">

      <div class="card-icon">
        📍
      </div>

      <div class="card-label">
        Coordinates
      </div>

      <div
        class="card-value"
        id="coords-text">

        Waiting...

      </div>

    </div>


    <div class="card">

      <div class="card-icon">
        🧠
      </div>

      <div class="card-label">
        Memory
      </div>

      <div
        class="card-value purple"
        id="memory-text">

        Checking...

      </div>

    </div>

  </section>


  <!-- SERVER INFORMATION -->

  <section class="panel">

    <div class="panel-header">

      <div class="panel-title">
        🌐 Server Information
      </div>

      <div
        class="badge"
        id="connection-status">

        CONNECTING

      </div>

    </div>


    <div class="info-grid">


      <div class="info">

        <small>
          SERVER ADDRESS
        </small>

        <span>
          ${config.server.ip}
        </span>

      </div>


      <div class="info">

        <small>
          BOT PROCESS
        </small>

        <span id="process-status">
          Starting...
        </span>

      </div>


      <div class="info">

        <small>
          LAST ACTIVITY
        </small>

        <span id="activity-text">
          Waiting...
        </span>

      </div>


      <div class="info">

        <small>
          RECONNECT ATTEMPTS
        </small>

        <span id="reconnect-text">
          0
        </span>

      </div>


      <div class="info">

        <small>
          API
        </small>

        <span id="api-status">
          Checking...
        </span>

      </div>


      <div class="info">

        <small>
          LAST UPDATE
        </small>

        <span id="last-update">
          Never
        </span>

      </div>


    </div>


    <div class="actions">

      <a
        href="/tutorial"
        class="btn btn-primary">

        📖 Setup Guide →

      </a>

      <button
        class="btn"
        onclick="copyServer()">

        📋 Copy Address

      </button>

    </div>

  </section>


  <!-- CONNECTION -->

  <section class="connection">

    <div class="connection-top">

      <span>
        LIVE CONNECTION
      </span>

      <span id="connection-text">
        Checking...
      </span>

    </div>

    <div class="connection-bar">

      <div
        class="connection-fill"
        id="activity-bar">
      </div>

    </div>

  </section>


  <footer>

    <strong>${config.name}</strong>
    • Live Monitoring
    • Auto Refresh: 1s

  </footer>

</div>


<div
  class="toast"
  id="toast">

  Done!

</div>


<script>

/* =========================================
   UPTIME
========================================= */

function formatUptime(seconds) {

  seconds = Math.max(
    0,
    Number(seconds) || 0
  );

  const h = Math.floor(
    seconds / 3600
  );

  const m = Math.floor(
    (seconds % 3600) / 60
  );

  const s = seconds % 60;

  return \`\${h}h \${m}m \${s}s\`;
}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.innerText = message;

  toast.classList.add("show");

  setTimeout(function() {

    toast.classList.remove("show");

  }, 2000);
}


/* =========================================
   COPY
========================================= */

function copyServer() {

  const address =
    "${config.server.ip}";

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(address)
      .then(function() {

        showToast(
          "Server address copied! ✓"
        );

      })
      .catch(function() {

        showToast(
          "Copy failed"
        );

      });

  } else {

    const input =
      document.createElement("input");

    input.value = address;

    document.body.appendChild(input);

    input.select();

    try {

      document.execCommand("copy");

      showToast(
        "Server address copied! ✓"
      );

    } catch (e) {

      showToast(
        "Copy failed"
      );

    }

    input.remove();
  }
}


/* =========================================
   REFRESH
========================================= */

async function manualRefresh() {

  const button =
    document.getElementById(
      "refresh-btn"
    );

  button.classList.add("spin");

  await updateStats();

  setTimeout(function() {

    button.classList.remove("spin");

  }, 450);

  showToast(
    "Dashboard refreshed ✓"
  );
}


/* =========================================
   STATUS UI
========================================= */

function setStatus(connected) {

  const statusText =
    document.getElementById(
      "status-text"
    );

  const statusLabel =
    document.getElementById(
      "status-label"
    );

  const statusDot =
    document.getElementById(
      "status-dot"
    );

  const description =
    document.getElementById(
      "status-description"
    );

  const connection =
    document.getElementById(
      "connection-status"
    );

  const process =
    document.getElementById(
      "process-status"
    );


  if (connected) {

    statusText.innerText =
      "Online";

    statusText.className =
      "card-value green";

    statusLabel.innerText =
      "ONLINE";

    statusLabel.style.color =
      "var(--green)";

    statusDot.style.background =
      "var(--green)";

    statusDot.style.boxShadow =
      "0 0 16px var(--green)";

    description.innerText =
      "Server is connected and running normally.";

    connection.innerText =
      "CONNECTED";

    connection.style.color =
      "var(--green)";

    process.innerText =
      "Running";

  } else {

    statusText.innerText =
      "Reconnecting";

    statusText.className =
      "card-value red";

    statusLabel.innerText =
      "OFFLINE";

    statusLabel.style.color =
      "var(--red)";

    statusDot.style.background =
      "var(--red)";

    statusDot.style.boxShadow =
      "0 0 16px var(--red)";

    description.innerText =
      "Connection lost. Attempting to reconnect...";

    connection.innerText =
      "RECONNECTING";

    connection.style.color =
      "var(--red)";

    process.innerText =
      "Reconnecting";
  }
}


/* =========================================
   MAIN UPDATE
========================================= */

async function updateStats() {

  const started =
    performance.now();

  try {

    const response =
      await fetch(
        "/health",
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }

    const data =
      await response.json();


    /* Ping */

    const ping =
      Math.round(
        performance.now() - started
      );


    /* Status */

    setStatus(
      data.status === "connected"
    );


    /* Uptime */

    document.getElementById(
      "uptime-text"
    ).innerText =
      formatUptime(
        data.uptime
      );


    /* Coordinates */

    const coords =
      document.getElementById(
        "coords-text"
      );


    if (
      data.coords &&
      typeof data.coords.x === "number" &&
      typeof data.coords.y === "number" &&
      typeof data.coords.z === "number"
    ) {

      coords.innerText =
        \`\${Math.floor(data.coords.x)}, \${Math.floor(data.coords.y)}, \${Math.floor(data.coords.z)}\`;

    } else {

      coords.innerText =
        "Unknown";

    }


    /* Memory */

    const memory =
      document.getElementById(
        "memory-text"
      );


    if (
      typeof data.memoryUsage ===
      "number"
    ) {

      memory.innerText =
        data.memoryUsage.toFixed(1) +
        " MB";

    } else {

      memory.innerText =
        "Unavailable";

    }


    /* Activity */

    const activity =
      document.getElementById(
        "activity-text"
      );


    if (data.lastActivity) {

      activity.innerText =
        String(
          data.lastActivity
        );

    } else {

      activity.innerText =
        "No recent activity";

    }


    /* Reconnects */

    document.getElementById(
      "reconnect-text"
    ).innerText =
      Number(
        data.reconnectAttempts || 0
      );


    /* API */

    document.getElementById(
      "api-status"
    ).innerText =
      "Healthy";


    /* Last update */

    document.getElementById(
      "last-update"
    ).innerText =
      new Date().toLocaleTimeString();


    /* Connection */

    document.getElementById(
      "connection-text"
    ).innerText =
      "Live • " + ping + "ms";


  } catch (error) {

    console.error(
      "Dashboard health check failed:",
      error
    );


    setStatus(false);


    document.getElementById(
      "api-status"
    ).innerText =
      "Unavailable";


    document.getElementById(
      "connection-text"
    ).innerText =
      "Connection lost";


    document.getElementById(
      "memory-text"
    ).innerText =
      "Unavailable";


    document.getElementById(
      "coords-text"
    ).innerText =
      "Unavailable";

  }
}


/* =========================================
   START
========================================= */

updateStats();

setInterval(
  updateStats,
  1000
);

</script>

</body>
</html>
  `);
});

app.get('/tutorial', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>${config.name} - Setup Guide</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #cbd5e1; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          h1, h2 { color: #2dd4bf; }
          h1 { border-bottom: 2px solid #334155; padding-bottom: 10px; }
          .card { background: #1e293b; padding: 25px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #334155; }
          a { color: #38bdf8; text-decoration: none; }
          code { background: #334155; padding: 2px 6px; border-radius: 4px; color: #e2e8f0; font-family: monospace; }
          .btn-home { display: inline-block; margin-bottom: 20px; padding: 8px 16px; background: #334155; color: white; border-radius: 6px; text-decoration: none; }
        </style>
      </head>
      <body>
        <a href="/" class="btn-home">Back to Dashboard</a>
        <h1>Setup Guide (Under 15 Minutes)</h1>
        
        <div class="card">
          <h2>Step 1: Configure Aternos</h2>
          <ol>
            <li>Go to <strong>Aternos</strong>.</li>
            <li>Install <strong>Paper/Bukkit</strong> software.</li>
            <li>Enable <strong>Cracked</strong> mode (Green Switch).</li>
            <li>Install Plugins: <code>ViaVersion</code>, <code>ViaBackwards</code>, <code>ViaRewind</code>.</li>
          </ol>
        </div>

        <div class="card">
          <h2>Step 2: GitHub Setup</h2>
          <ol>
            <li>Download this code as ZIP and extract.</li>
            <li>Edit <code>settings.json</code> with your IP/Port.</li>
            <li>Upload all files to a new <strong>GitHub Repository</strong>.</li>
          </ol>
        </div>

        <div class="card">
          <h2>Step 3: Render (Free 24/7 Hosting)</h2>
          <ol>
            <li>Go to <a href="https://render.com" target="_blank">Render.com</a> and create a Web Service.</li>
            <li>Connect your GitHub.</li>
            <li>Build Command: <code>npm install</code></li>
            <li>Start Command: <code>npm start</code></li>
            <li><strong>Magic:</strong> The bot automatically pings itself to stay awake!</li>
          </ol>
        </div>
        
        <p style="text-align: center; margin-top: 40px; color: #64748b;">AFK Bot Dashboard</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    status: botState.connected ? 'connected' : 'disconnected',
    uptime: Math.floor((Date.now() - botState.startTime) / 1000),
    coords: (bot && bot.entity) ? bot.entity.position : null,
    lastActivity: botState.lastActivity,
    reconnectAttempts: botState.reconnectAttempts,
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
  });
});

app.get('/ping', (req, res) => res.send('pong'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] HTTP server started on port ${PORT}`);
});

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// ============================================================
// SELF-PING - Prevent Render from sleeping
// ============================================================
const SELF_PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

const https = require('https');

function startSelfPing() {
  setInterval(() => {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(`${url}/ping`, (res) => {
      // console.log(`[KeepAlive] Self-ping: ${res.statusCode}`); // Optional: reduce spam
    }).on('error', (err) => {
      console.log(`[KeepAlive] Self-ping failed: ${err.message}`);
    });
  }, SELF_PING_INTERVAL);
  console.log('[KeepAlive] Self-ping system started (every 10 min)');
}

startSelfPing();

// ============================================================
// MEMORY MONITORING
// ============================================================
setInterval(() => {
  const mem = process.memoryUsage();
  const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(2);
  console.log(`[Memory] Heap: ${heapMB} MB`);
}, 5 * 60 * 1000); // Every 5 minutes

// ============================================================
// BOT CREATION WITH RECONNECTION LOGIC
// ============================================================
let bot = null;
let activeIntervals = [];
let reconnectTimeout = null;
let isReconnecting = false;

function clearAllIntervals() {
  console.log(`[Cleanup] Clearing ${activeIntervals.length} intervals`);
  activeIntervals.forEach(id => clearInterval(id));
  activeIntervals = [];
}

function addInterval(callback, delay) {
  const id = setInterval(callback, delay);
  activeIntervals.push(id);
  return id;
}

function getReconnectDelay() {
  // Aggressive reconnection: fast, flat delay or very subtle backoff
  const baseDelay = config.utils['auto-reconnect-delay'] || 2000;
  const maxDelay = config.utils['max-reconnect-delay'] || 15000;

  // Use a much gentler backoff or just a flat delay if user wants "lower"
  // Current logic: attempts * 1000 + base, capped at max
  const delay = Math.min(baseDelay + (botState.reconnectAttempts * 1000), maxDelay);

  return delay;
}

function createBot() {
  if (isReconnecting) {
    console.log('[Bot] Already reconnecting, skipping...');
    return;
  }

  // Cleanup previous bot
  if (bot) {
    clearAllIntervals();
    try {
      bot.removeAllListeners();
      bot.end();
    } catch (e) {
      console.log('[Cleanup] Error ending previous bot:', e.message);
    }
    bot = null;
  }

  console.log(`[Bot] Creating bot instance...`);
  console.log(`[Bot] Connecting to ${config.server.ip}:${config.server.port}`);

  try {
    bot = mineflayer.createBot({
      username: config['bot-account'].username,
      password: config['bot-account'].password || undefined,
      auth: config['bot-account'].type,
      host: config.server.ip,
      port: config.server.port,
      version: config.server.version,
      hideErrors: false,
      checkTimeoutInterval: 120000 // 2 minutes - detects dead connections without false-positive disconnects
    });

    bot.loadPlugin(pathfinder);

    // Connection timeout - if no spawn in 60s, reconnect
    const connectionTimeout = setTimeout(() => {
      if (!botState.connected) {
        console.log('[Bot] Connection timeout - no spawn received');
        scheduleReconnect();
      }
    }, 60000);

    bot.once('spawn', () => {
  clearTimeout(connectionTimeout);
  botState.connected = true;
  botState.lastActivity = Date.now();
  botState.reconnectAttempts = 0;
  isReconnecting = false;

  console.log(`[Bot] [+] Successfully spawned on server!`);

  // 🔐 FORCE LOGIN SYSTEM (Perzaan Edition)

      bot.on('messagestr', (msg) => {
  const message = msg.toLowerCase();

  // Login
  if (message.includes('login')) {
    bot.chat('/login Perzuu');
    console.log('[Auth] Login detected');
  }

  // Register
  if (message.includes('register')) {
    bot.chat('/register Perzuu Perzuu');
    console.log('[Auth] Register detected');
  }

  // Creative mode success
  if (
    message.includes('commands.gamemode.success.self') ||
    message.includes('set own game mode to creative mode')
  ) {
    console.log('[INFO] Bot is now in Creative Mode.');

    bot.chat('/gamerule sendCommandFeedback false');
  }
});

      if (config.discord && config.discord.events.connect) {
  sendDiscordWebhook(`[+] **Connected** to \`${config.server.ip}\``, 0x4ade80);
}

const mcData = require('minecraft-data')(config.server.version);
const defaultMove = new Movements(bot, mcData);

initializeModules(bot, mcData, defaultMove);
setupLeaveRejoin(bot, createBot);

setTimeout(() => {
  if (bot && botState.connected) {
    bot.chat('/gamerule sendCommandFeedback false');
  }
}, 3000);

setTimeout(() => {
  if (bot && botState.connected) {
    bot.chat('/gamemode creative');
    console.log('[INFO] Attempted to set creative mode (requires OP)');
  }
}, 3000);

});

    // Handle disconnection
    bot.on('end', (reason) => {
      const wasSpawned = botState.connected;
      console.log(`[Bot] Disconnected: ${reason || 'Unknown reason'}`);
      botState.connected = false;
      clearAllIntervals();

      if (config.discord && config.discord.events.disconnect && reason !== 'Periodic Rejoin') {
        sendDiscordWebhook(`[-] **Disconnected**: ${reason || 'Unknown'}`, 0xf87171); // Red
      }

      if (config.utils['auto-reconnect']) {
        scheduleReconnect();
      }
    });

    bot.on("kicked", (reason) => {
    console.log(
        "[KICK]",
        typeof reason === "string"
            ? reason
            : JSON.stringify(reason, null, 2)
    );
});

    bot.on('error', (err) => {
      console.log(`[Bot] Error: ${err.message}`);
      botState.errors.push({ type: 'error', message: err.message, time: Date.now() });
      // Don't immediately reconnect on error - let 'end' event handle it
    });

  } catch (err) {
    console.log(`[Bot] Failed to create bot: ${err.message}`);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  if (isReconnecting) {
    return;
  }

  isReconnecting = true;
  botState.reconnectAttempts++;

  const delay = getReconnectDelay();
  console.log(`[Bot] Reconnecting in ${delay / 1000}s (attempt #${botState.reconnectAttempts})`);

  reconnectTimeout = setTimeout(() => {
    isReconnecting = false;
    createBot();
  }, delay);
}

// ============================================================
// MODULE INITIALIZATION
// ============================================================
function initializeModules(bot, mcData, defaultMove) {
  console.log('[Modules] Initializing all modules...');

  // ---------- AUTO AUTH ----------
  let authDone = false;

bot.on('messagestr', (msg) => {
  const message = msg.toLowerCase();

  if (authDone) return;

  if (message.includes('/register') || message.includes('register')) {
    authDone = true;
    bot.chat('/register Perzuu Perzuu');
    console.log('[Auth] Register sent');
    return;
  }

  if (message.includes('/login') || message.includes('login')) {
    authDone = true;
    bot.chat('/login Perzuu');
    console.log('[Auth] Login sent');
    return;
  }
});

  // ---------- MOVE TO POSITION ----------
  if (config.position.enabled) {
    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalBlock(config.position.x, config.position.y, config.position.z));
  }

  // ---------- ANTI-AFK (Simple) ----------
  if (config.utils['anti-afk'].enabled) {
    addInterval(() => {
      if (bot && botState.connected) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          if (bot) bot.setControlState('jump', false);
        }, 100);
        botState.lastActivity = Date.now();
      }
    }, 3000); // Jump every 30 seconds

    if (config.utils['anti-afk'].sneak) {
      bot.setControlState('sneak', true);
    }
  }

  // ---------- MOVEMENT MODULES ----------
  if (config.movement['circle-walk'].enabled) {
    startCircleWalk(bot, defaultMove);
  }
  if (config.movement['random-jump'].enabled) {
    startRandomJump(bot);
  }
  if (config.movement['look-around'].enabled) {
    startLookAround(bot);
  }

  // ---------- CUSTOM MODULES ----------
  if (config.modules.avoidMobs) avoidMobs(bot);
  if (config.modules.combat) combatModule(bot, mcData);
  if (config.modules.beds) bedModule(bot, mcData);
  if (config.modules.chat) chatModule(bot);

  // Periodic Rejoin
  if (config.utils['periodic-rejoin'] && config.utils['periodic-rejoin'].enabled) {
    periodicRejoin(bot);
  }

  console.log('[Modules] All modules initialized!');
}

// Periodic Rejoin Module
const setupLeaveRejoin = require('./leaveRejoin');

// Periodic Rejoin Module - Handled by leaveRejoin.js now
function periodicRejoin(bot) {
  // Deprecated in favor of leaveRejoin.js
  console.log('[Rejoin] Using new leaveRejoin system.');
}

// ============================================================
// MOVEMENT HELPERS
// ============================================================
function startCircleWalk(bot, defaultMove) {
  const radius = config.movement['circle-walk'].radius;
  let angle = 0;
  let lastPathTime = 0;

  addInterval(() => {
    if (!bot || !botState.connected) return;

    // Rate limit pathfinding
    const now = Date.now();
    if (now - lastPathTime < 2000) return;
    lastPathTime = now;

    try {
      const x = bot.entity.position.x + Math.cos(angle) * radius;
      const z = bot.entity.position.z + Math.sin(angle) * radius;
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalBlock(Math.floor(x), Math.floor(bot.entity.position.y), Math.floor(z)));
      angle += Math.PI / 4;
      botState.lastActivity = Date.now();
    } catch (e) {
      console.log('[CircleWalk] Error:', e.message);
    }
  }, config.movement['circle-walk'].speed);
}

function startRandomJump(bot) {
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      bot.setControlState('jump', true);
      setTimeout(() => {
        if (bot) bot.setControlState('jump', false);
      }, 300);
      botState.lastActivity = Date.now();
    } catch (e) {
      console.log('[RandomJump] Error:', e.message);
    }
  }, config.movement['random-jump'].interval);
}

function startLookAround(bot) {
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI / 4;
      bot.look(yaw, pitch, true);
      botState.lastActivity = Date.now();
    } catch (e) {
      console.log('[LookAround] Error:', e.message);
    }
  }, config.movement['look-around'].interval);
}

// ============================================================
// CUSTOM MODULES
// ============================================================

// Avoid mobs/players
function avoidMobs(bot) {
  const safeDistance = 5;
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      const entities = Object.values(bot.entities).filter(e =>
        e.type === 'mob' || (e.type === 'player' && e.username !== bot.username)
      );
      for (const e of entities) {
        if (!e.position) continue;
        const distance = bot.entity.position.distanceTo(e.position);
        if (distance < safeDistance) {
          bot.setControlState('back', true);
          setTimeout(() => {
            if (bot) bot.setControlState('back', false);
          }, 500);
          break;
        }
      }
    } catch (e) {
      console.log('[AvoidMobs] Error:', e.message);
    }
  }, 2000);
}

// Combat module
function combatModule(bot, mcData) {
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      if (config.combat['attack-mobs']) {
        const mobs = Object.values(bot.entities).filter(e =>
          e.type === 'mob' && e.position &&
          bot.entity.position.distanceTo(e.position) < 4
        );
        if (mobs.length > 0) {
          bot.attack(mobs[0]);
        }
      }
    } catch (e) {
      console.log('[Combat] Error:', e.message);
    }
  }, 1500);

  bot.on('health', () => {
    if (!config.combat['auto-eat']) return;
    try {
      if (bot.food < 14) {
        const food = bot.inventory.items().find(i => {
          const itemData = mcData.itemsByName[i.name];
          return itemData && itemData.food;
        });
        if (food) {
          bot.equip(food, 'hand')
            .then(() => bot.consume())
            .catch(e => console.log('[AutoEat] Error:', e.message));
        }
      }
    } catch (e) {
      console.log('[AutoEat] Error:', e.message);
    }
  });
}

// Bed module (FIXED - beds are blocks, not entities)
function bedModule(bot, mcData) {
  addInterval(async () => {
    if (!bot || !botState.connected) return;

    try {
      const isNight = bot.time.timeOfDay >= 12500 && bot.time.timeOfDay <= 23500;

      if (config.beds['place-night'] && isNight && !bot.isSleeping) {
        // Find nearby bed blocks
        const bedBlock = bot.findBlock({
          matching: block => block.name.includes('bed'),
          maxDistance: 8
        });

        if (bedBlock) {
          try {
            await bot.sleep(bedBlock);
            console.log('[Bed] Sleeping...');
          } catch (e) {
            // Can't sleep - maybe not night enough or monsters nearby
          }
        }
      }
    } catch (e) {
      console.log('[Bed] Error:', e.message);
    }
  }, 10000);
}

// Chat module
function chatModule(bot) {
  bot.on('chat', (username, message) => {
    if (!bot || username === bot.username) return;

    try {
      if (config.chat.respond) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
          bot.chat(`Hello, ${username}!`);
        }
        if (message.startsWith('!tp ') && config.chat.respond) {
          const target = message.split(' ')[1];
          if (target) bot.chat(`/tp ${target}`);
        }
      }
    } catch (e) {
      console.log('[Chat] Error:', e.message);
    }
  });
}

// ============================================================
// CONSOLE COMMANDS
// ============================================================
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!bot || !botState.connected) {
    console.log('[Console] Bot not connected');
    return;
  }

  const trimmed = line.trim();
  if (trimmed.startsWith('say ')) {
    bot.chat(trimmed.slice(4));
  } else if (trimmed.startsWith('cmd ')) {
    bot.chat('/' + trimmed.slice(4));
  } else if (trimmed === 'status') {
    console.log(`Connected: ${botState.connected}, Uptime: ${formatUptime(Math.floor((Date.now() - botState.startTime) / 1000))}`);
  } else if (trimmed === 'reconnect') {
    console.log('[Console] Manual reconnect requested');
    bot.end();
  } else {
    bot.chat(trimmed);
  }
});

// ============================================================
// DISCORD WEBHOOK INTEGRATION
// ============================================================
function sendDiscordWebhook(content, color = 0x0099ff) {
  if (!config.discord || !config.discord.enabled || !config.discord.webhookUrl || config.discord.webhookUrl.includes('YOUR_DISCORD')) return;

  const protocol = config.discord.webhookUrl.startsWith('https') ? https : http;
  const urlParts = new URL(config.discord.webhookUrl);

  const payload = JSON.stringify({
    username: config.name,
    embeds: [{
      description: content,
      color: color,
      timestamp: new Date().toISOString(),
      footer: { text: 'Slobos AFK Bot' }
    }]
  });

  const options = {
    hostname: urlParts.hostname,
    port: 443,
    path: urlParts.pathname + urlParts.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = protocol.request(options, (res) => {
    // console.log(`[Discord] Sent webhook: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.log(`[Discord] Error sending webhook: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

// ============================================================
// CRASH RECOVERY - IMMORTAL MODE
// ============================================================
process.on('uncaughtException', (err) => {
  console.log(`[FATAL] Uncaught Exception: ${err.message}`);
  // console.log(err.stack); // Optional: keep logs cleaner
  botState.errors.push({ type: 'uncaught', message: err.message, time: Date.now() });

  // CRITICAL: DO NOT EXIT.
  // The user wants the server to stay up "all the time no matter what".
  // We just clear intervals and try to restart the bot logic.
  if (config.utils['auto-reconnect']) {
    clearAllIntervals();
    // Wrap in a tiny timeout to prevent tight loops if the error is synchronous
    setTimeout(() => {
      scheduleReconnect();
    }, 1000);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(`[FATAL] Unhandled Rejection: ${reason}`);
  botState.errors.push({ type: 'rejection', message: String(reason), time: Date.now() });
  // Do not exit.
});

// Graceful shutdown from external signals (still allowed to exit if system demands it)
process.on('SIGTERM', () => {
  console.log('[System] SIGTERM received. Ignoring to stay alive? (Render might force kill)');
  // If we mistakenly exit here, the web server dies. 
  // User asked for "all the time on no matter what".
  // Note: Render will SIGKILL if we don't exit, but this keeps us up as long as possible.
  process.exit(0);
});

process.on('SIGINT', () => {
  // Local Ctrl+C
  console.log('[System] Manual stop requested. Exiting...');
  process.exit(0);
});

// ============================================================
// START THE BOT
// ============================================================
console.log('='.repeat(50));
console.log('  Minecraft AFK Bot v2.3 - Bug Fix Edition');
console.log('='.repeat(50));
console.log(`Server: ${config.server.ip}:${config.server.port}`);
console.log(`Version: ${config.server.version}`);
console.log(`Auto-Reconnect: ${config.utils['auto-reconnect'] ? 'Enabled' : 'Disabled'}`);
console.log('='.repeat(50));

createBot();
