// Daily HQ private beta gate. Runs before the app: only a valid, unexpired invite code loads Daily HQ.
const VERSION = "Beta 0.9 · Nov 14, 2026";
const KEY = "dailyhq.beta";
const DAY = 86400e3;
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saveState = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
let st = load();
if (!st.device) { st.device = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36); saveState(st); }

const fromUrl = new URLSearchParams(location.search).get("invite");
if (fromUrl) {
  st.code = fromUrl.trim().toUpperCase(); st.okAt = 0; saveState(st);
  const u = new URL(location.href); u.searchParams.delete("invite"); history.replaceState(null, "", u.pathname + u.search + u.hash);
}

async function call(body) {
  const r = await fetch("/api/beta", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, device: st.device, ua: navigator.userAgent.slice(0, 160) }) });
  if (!r.ok && r.status >= 500) throw new Error("server");
  return r.json();
}
const check = (code) => call({ action: "check", code });

window.DHQ_BETA = {
  version: VERSION,
  get code() { return st.code; }, get name() { return st.name || ""; }, get expires() { return st.expires || null; }, get owner() { return !!st.owner; },
  feedback: (text, kind = "", page = "") => call({ action: "feedback", code: st.code, text, kind, page, version: VERSION }),
};

// ---------- screens
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function screen(html) {
  let el = document.getElementById("betaGate");
  if (!el) {
    el = document.createElement("div"); el.id = "betaGate";
    el.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg,#0b0f17);color:var(--text,#e7ebf3);font-family:Inter,system-ui,sans-serif;overflow:auto";
    document.body.append(el);
  }
  el.innerHTML = `<div style="width:min(420px,100%);text-align:center">
    <div style="width:64px;height:64px;margin:0 auto 18px;border-radius:18px;display:grid;place-items:center;font-weight:700;font-size:22px;color:#fff;background:linear-gradient(135deg,#5b8cff,#7c5cff)">HQ</div>${html}
    <p style="margin-top:28px;font-size:12px;color:var(--muted,#8a94a8)">${esc(VERSION)}</p></div>`;
  return el;
}
const btn = "display:block;width:100%;margin-top:12px;padding:13px;border-radius:12px;border:0;font:600 16px Inter,system-ui,sans-serif;cursor:pointer;background:#5b8cff;color:#fff";
const input = "display:block;width:100%;box-sizing:border-box;margin-top:18px;padding:13px 14px;border-radius:12px;border:1px solid var(--line,#26314d);background:var(--panel,#10172a);color:inherit;font:600 18px 'JetBrains Mono',ui-monospace,monospace;text-align:center;letter-spacing:1px;text-transform:uppercase";

function gate(msg = "") {
  const el = screen(`<h1 style="margin:0 0 8px;font-size:24px">Daily HQ beta</h1>
    <p style="margin:0;color:var(--muted,#8a94a8);font-size:15px;line-height:1.5">Daily HQ is in a private beta. Enter the invite code Dean sent you — it looks like <b>HQ-ABCD-1234</b>.</p>
    <form id="betaForm"><input id="betaCode" style="${input}" placeholder="HQ-XXXX-XXXX" autocomplete="one-time-code" autocapitalize="characters" value="${esc(st.code || "")}">
    <button style="${btn}" type="submit">Continue</button></form>
    <p id="betaMsg" style="min-height:20px;margin-top:12px;color:#ff7a85;font-size:14px">${esc(msg)}</p>`);
  el.querySelector("#betaForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    let code = el.querySelector("#betaCode").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.startsWith("HQ")) code = code.slice(2);
    code = `HQ-${code.slice(0, 4)}-${code.slice(4, 8)}`;
    el.querySelector("#betaMsg").textContent = "Checking…";
    try {
      const r = await check(code);
      if (r.ok) { Object.assign(st, { code, name: r.name, expires: r.expires, owner: r.owner, okAt: Date.now() }); saveState(st); el.remove(); boot(); }
      else el.querySelector("#betaMsg").textContent = reason(r.status);
    } catch { el.querySelector("#betaMsg").textContent = "Couldn't reach Daily HQ. Check your connection and try again."; }
  });
}
function reason(s) {
  return { unknown: "That code doesn't look right. Check it and try again.", expired: "That invite has ended.", revoked: "That invite has been switched off.", full: "That invite is already in use on its maximum number of devices. Ask Dean for another one." }[s] || "That code didn't work.";
}
function ended(status) {
  const el = screen(`<h1 style="margin:0 0 8px;font-size:24px">${status === "revoked" ? "Your beta access is off" : "The Daily HQ beta has ended"}</h1>
    <p style="margin:0;color:var(--muted,#8a94a8);font-size:15px;line-height:1.5">Thanks for testing${st.name ? ", " + esc(st.name.split(" ")[0]) : ""}! Your settings are still saved on this device in case Dean opens it up again.</p>
    <textarea id="betaFb" rows="4" placeholder="Any last thoughts for Dean? (optional)" style="${input};font:15px Inter,system-ui,sans-serif;text-align:left;text-transform:none;letter-spacing:0;resize:vertical"></textarea>
    <button id="betaSend" style="${btn}">Send feedback</button>
    <button id="betaNew" style="${btn};background:transparent;border:1px solid var(--line,#26314d);color:inherit">I have a new code</button>
    <p id="betaMsg" style="min-height:20px;margin-top:12px;font-size:14px;color:var(--muted,#8a94a8)"></p>`);
  el.querySelector("#betaNew").onclick = () => { st.code = ""; saveState(st); gate(); };
  el.querySelector("#betaSend").onclick = async () => {
    const t = el.querySelector("#betaFb").value.trim(); if (!t) return;
    try { const r = await window.DHQ_BETA.feedback(t, "final"); el.querySelector("#betaMsg").textContent = r.ok ? "Thanks — sent." : "Your invite has ended, so this couldn't be sent. Tell Dean directly!"; } catch { el.querySelector("#betaMsg").textContent = "Couldn't send. Check your connection."; }
  };
}

// ---------- start
let booted = false;
function boot() { if (booted) return; booted = true; import("/app.js"); }
async function start() {
  if (!st.code) return gate();
  if (st.expires && st.expires < Date.now()) return ended("expired");
  const recent = st.okAt && Date.now() - st.okAt < 7 * DAY;
  if (recent) boot();
  try {
    const r = await check(st.code);
    if (r.ok) { Object.assign(st, { name: r.name, expires: r.expires, owner: r.owner, okAt: Date.now() }); saveState(st); boot(); return; }
    st.okAt = 0; st.expires = r.expires ?? st.expires; saveState(st);
    if (r.status === "expired" || r.status === "revoked") return ended(r.status);
    return gate(reason(r.status));
  } catch {
    if (recent) return; // offline: keep working for up to a week since the last check
    return gate("Couldn't reach Daily HQ to check your invite. Check your connection and try again.");
  }
}
// Re-check when the app comes back to the foreground (at most every 6 hours), so ending a beta takes effect quickly.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && booted && st.code && Date.now() - (st.okAt || 0) > 6 * 3600e3) {
    check(st.code).then((r) => { if (r.ok) { st.okAt = Date.now(); st.expires = r.expires; saveState(st); } else if (r.status === "expired" || r.status === "revoked") { st.okAt = 0; saveState(st); ended(r.status); } }).catch(() => {});
  }
});
start();
