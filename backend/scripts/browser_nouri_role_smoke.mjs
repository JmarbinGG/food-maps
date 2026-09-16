/**
 * Headed Playwright smoke: Nouri AI chat for recipient / donor / admin.
 *
 * Local (separate smoke users):
 *   node backend/scripts/browser_nouri_role_smoke.mjs
 *
 * Production (single known account; switches role + restores admin):
 *   $env:SMOKE_BASE_URL="https://dogoodfoodmaps.com"
 *   $env:SMOKE_EMAIL="you@example.com"
 *   $env:SMOKE_PASSWORD="..."
 *   $env:SMOKE_SWITCH_ROLES="1"
 *   $env:SMOKE_ADMIN_SECRET="..."   # for /api/admin/make-admin restore
 *   $env:SMOKE_ARTIFACTS="artifacts/nouri-browser-prod"
 *   node backend/scripts/browser_nouri_role_smoke.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const BASE = (process.env.SMOKE_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const PASSWORD = process.env.SMOKE_PASSWORD || "password123";
const SWITCH_ROLES = process.env.SMOKE_SWITCH_ROLES === "1";
const SMOKE_EMAIL = process.env.SMOKE_EMAIL || "";
const ADMIN_SECRET = process.env.SMOKE_ADMIN_SECRET || "";
const ARTIFACTS = path.join(
  ROOT,
  process.env.SMOKE_ARTIFACTS || "artifacts/nouri-browser"
);
const HEADED = process.env.SMOKE_HEADED !== "0";

const ROLE_PROMPTS = [
  {
    role: "admin",
    email: "admin.smoke@example.com",
    prompt:
      "Give me a quick platform overview or stats for Food Maps as an admin. Use get_platform_stats if you can.",
    expectAny: [/\b(admin|stats?|platform|members?|overview|dashboard|total|get_platform_stats|platform health|live donations)\b/i],
    forbidAny: [],
  },
  {
    role: "recipient",
    email: "recipient.smoke@example.com",
    prompt:
      "I need food near me. Please search for available listings I can claim. Do not create a donation listing.",
    expectAny: [/\b(search|find|listing|claim|food|nearby|available|map|request)\b/i],
    forbidAny: [/posted your listing|listing created|successfully posted/i],
  },
  {
    role: "donor",
    email: "donor.smoke@example.com",
    prompt:
      "I want to share leftover packaged food. Help me list or donate it. Do not claim someone else's food.",
    expectAny: [/\b(share|list|donat\w*|post|listing|food|title|quantity|pickup|school|community)\b/i],
    forbidAny: [/claimed for you|successfully claimed|claim confirmed/i],
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiLogin(email, password, { retries = 8 } = {}) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${BASE}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 429) {
      const wait = 30000 * (i + 1);
      console.log(`  login rate-limited; waiting ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      throw new Error(`login ${email} failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    if (!data.token) throw new Error(`login ${email}: no token`);
    return data.token;
  }
  throw lastErr || new Error(`login ${email}: rate limited`);
}

async function fetchMe(token) {
  const res = await fetch(`${BASE}/api/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`/api/user/me failed: ${res.status}`);
  return res.json();
}

async function setRole(token, role) {
  const res = await fetch(`${BASE}/api/user/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    throw new Error(`setRole(${role}) failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function restoreAdmin(email) {
  if (!ADMIN_SECRET) {
    console.warn("  SMOKE_ADMIN_SECRET unset — cannot restore admin via API");
    return false;
  }
  const res = await fetch(`${BASE}/api/admin/make-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, secret: ADMIN_SECRET }),
  });
  if (!res.ok) {
    console.warn(`  make-admin failed: ${res.status} ${await res.text()}`);
    return false;
  }
  console.log(`  restored admin for ${email}`);
  return true;
}

/** Prod profile updates may omit token — re-login after switch when needed. */
async function prepareTokenForRole(spec) {
  const email = SWITCH_ROLES && SMOKE_EMAIL ? SMOKE_EMAIL : spec.email;

  if (!SWITCH_ROLES || !SMOKE_EMAIL) {
    const token = await apiLogin(email, PASSWORD);
    const me = await fetchMe(token);
    return { token, me, email };
  }

  if (spec.role === "admin") {
    await restoreAdmin(email);
    await sleep(2000);
    const token = await apiLogin(email, PASSWORD);
    const me = await fetchMe(token);
    return { token, me, email };
  }

  // recipient/donor: need admin privilege on prod to switch, then fresh JWT via login
  await restoreAdmin(email);
  await sleep(2000);
  let token = await apiLogin(email, PASSWORD);
  await setRole(token, spec.role);
  console.log(`  switched DB role -> ${spec.role}; waiting before re-login for JWT...`);
  await sleep(90000); // avoid prod login rate limit
  token = await apiLogin(email, PASSWORD);
  const me = await fetchMe(token);
  return { token, me, email };
}

function collectText(dialog) {
  return dialog.innerText().catch(() => "");
}

async function waitForAssistantReply(dialog, previousText, timeoutMs = 90000) {
  const start = Date.now();
  let last = previousText;
  while (Date.now() - start < timeoutMs) {
    await sleep(1500);
    const text = await collectText(dialog);
    if (text && text.length > previousText.length + 40 && text !== last) {
      await sleep(2500);
      const settled = await collectText(dialog);
      if (settled.length >= text.length) return settled;
      last = settled;
      continue;
    }
    last = text;
  }
  return last;
}

async function openNouri(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Open Nouri AI Assistant"]');
    if (btn) {
      btn.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
      );
    }
  });
  const dialog = page.getByRole("dialog", { name: "Nouri AI Assistant" });
  await dialog.waitFor({ state: "visible", timeout: 20000 });
  return dialog;
}

async function runRole(browser, spec) {
  const result = {
    role: spec.role,
    email: SWITCH_ROLES && SMOKE_EMAIL ? SMOKE_EMAIL : spec.email,
    pass: false,
    reasons: [],
    replySnippet: "",
  };

  let token;
  let me;
  try {
    ({ token, me, email: result.email } = await prepareTokenForRole(spec));
    console.log(`  active role in /me: ${me.role} is_admin=${me.is_admin}`);
  } catch (err) {
    result.reasons.push(String(err && err.message ? err.message : err));
    return result;
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    const startUrl = `${BASE}/index.html`;
    await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.evaluate(
      ({ token, me }) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("token", token);
        localStorage.setItem("tutorial_completed", "true");
        sessionStorage.setItem("tutorial_shown_this_session", "true");
        localStorage.setItem(
          "current_user",
          JSON.stringify({
            id: me.id,
            email: me.email,
            name: me.name,
            role: me.role,
            is_admin: me.is_admin,
            onboardingCompleted: true,
          })
        );
        window.dispatchEvent(new Event("foodmaps:auth_changed"));
      },
      { token, me }
    );
    await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("foodmaps:auth_changed"));
    });

    for (const label of ["Skip tutorial", "Skip"]) {
      const el = page.getByText(new RegExp(label, "i")).first();
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        await el.click({ force: true });
        break;
      }
    }

    await page.locator('button[aria-label="Open Nouri AI Assistant"]').waitFor({
      state: "visible",
      timeout: 45000,
    });
    let dialog = await openNouri(page);

    // Clear prior server-side chat history so role replies aren't polluted.
    const chatMenu = dialog.locator('button[aria-label="Chat menu"]');
    if (await chatMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chatMenu.click({ force: true });
      await page.waitForTimeout(400);
      const clearBtn = page.getByText(/Clear conversation/i).first();
      if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await clearBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }
    }
    // Re-open if clear/menu flow closed the panel.
    if (!(await dialog.isVisible().catch(() => false))) {
      dialog = await openNouri(page);
    }

    const textarea = dialog.locator("textarea").first();
    await textarea.waitFor({ state: "visible", timeout: 15000 });
    await textarea.click({ force: true });
    const before = await collectText(dialog);

    await textarea.pressSequentially(spec.prompt, { delay: 8 });

    const chatResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/ai/") &&
        res.request().method() === "POST" &&
        res.status() < 500,
      { timeout: 120000 }
    );

    await textarea.press("Enter");
    try {
      await chatResponsePromise;
    } catch (_) {
      await dialog.locator('button[aria-label="Send message"]').click({ force: true });
      await page.waitForResponse(
        (res) => res.url().includes("/api/ai/") && res.request().method() === "POST",
        { timeout: 120000 }
      );
    }

    const after = await waitForAssistantReply(dialog, before, 60000);
    // Score only new panel text so prior chat history / the user prompt cannot fake a pass.
    const delta = (after || "").slice((before || "").length);
    result.replySnippet = (delta || after || "").replace(/\s+/g, " ").trim().slice(-800);

    const shot = path.join(ARTIFACTS, `${spec.role}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    result.screenshot = shot;

    const matchedExpect = spec.expectAny.some((re) => re.test(delta || ""));
    const hitForbid = spec.forbidAny.some((re) => re.test(delta || ""));
    const hasAssistant =
      delta.length > 40 &&
      /sorry|happy|great|help|food|listing|share|stat|member|claim|search|donat|request|scoop|platform|health/i.test(
        delta
      );

    if (!matchedExpect) {
      result.reasons.push("assistant reply missing expected role keywords");
    }
    if (hitForbid) {
      result.reasons.push("assistant reply hit forbidden success phrase for this role");
    }
    if (!hasAssistant) {
      result.reasons.push("no meaningful assistant reply within timeout");
    }

    result.pass = matchedExpect && !hitForbid && result.reasons.length === 0;
    if (result.pass) result.reasons.push("ok");
  } catch (err) {
    result.reasons.push(String(err && err.message ? err.message : err));
    try {
      const shot = path.join(ARTIFACTS, `${spec.role}-error.png`);
      await page.screenshot({ path: shot, fullPage: true });
      result.screenshot = shot;
    } catch (_) {
      /* ignore */
    }
  } finally {
    await context.close();
  }

  return result;
}

async function main() {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  console.log(`Target: ${BASE}`);
  console.log(`Switch roles: ${SWITCH_ROLES} email=${SMOKE_EMAIL || "(per-role)"}`);

  const health = await fetch(`${BASE}/api/ai/health`).catch((e) => {
    throw new Error(`Server not reachable at ${BASE}: ${e.message}`);
  });
  if (!health.ok) throw new Error(`/api/ai/health => ${health.status}`);

  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: HEADED ? 40 : 0,
  });

  const results = [];
  try {
    const roles = process.env.SMOKE_ONLY_ROLE
      ? ROLE_PROMPTS.filter((r) => r.role === process.env.SMOKE_ONLY_ROLE)
      : ROLE_PROMPTS;
    if (!roles.length) throw new Error(`No roles matched SMOKE_ONLY_ROLE=${process.env.SMOKE_ONLY_ROLE}`);
    for (const spec of roles) {
      console.log(`\n=== Testing ${spec.role} ===`);
      const r = await runRole(browser, spec);
      results.push(r);
      console.log(r.pass ? "PASS" : "FAIL", r.reasons.join("; "));
      if (r.replySnippet) console.log("snippet:", r.replySnippet.slice(0, 280));
      await sleep(3000);
    }
  } finally {
    await browser.close();
    if (SWITCH_ROLES && SMOKE_EMAIL) {
      await restoreAdmin(SMOKE_EMAIL);
    }
  }

  console.log("\n========== SUMMARY ==========");
  for (const r of results) {
    console.log(
      `${r.pass ? "PASS" : "FAIL"}  ${r.role.padEnd(10)}  ${r.reasons.join("; ")}  shot=${r.screenshot || "-"}`
    );
  }

  const out = path.join(ARTIFACTS, "summary.json");
  fs.writeFileSync(out, JSON.stringify({ base: BASE, results }, null, 2));
  console.log("Wrote", out);

  if (results.some((r) => !r.pass)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
