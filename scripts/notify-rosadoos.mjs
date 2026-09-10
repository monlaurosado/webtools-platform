// Runs only after the standalone validation job has succeeded on main.
const token = process.env.ROSADOOS_DISPATCH_TOKEN;
const sha = process.env.SOURCE_SHA;
if (process.env.GITHUB_REPOSITORY !== "monlaurosado/webtools-platform"
  || process.env.GITHUB_REF !== "refs/heads/main" || !/^[0-9a-f]{40}$/.test(sha || "")) {
  throw new Error("Only an exact commit on WebTools main can notify RosadoOS.");
}
if (!token) throw new Error("Configure ROSADOOS_DISPATCH_TOKEN: a GitHub App token or fine-grained PAT with Contents write on monlaurosado/RosadoOS only.");
const response = await fetch("https://api.github.com/repos/monlaurosado/RosadoOS/dispatches", {
  method: "POST",
  headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
  body: JSON.stringify({ event_type: "webtools-updated", client_payload: { repository: "monlaurosado/webtools-platform", sha } }),
  signal: AbortSignal.timeout(30_000),
});
if (response.status !== 204) throw new Error(`RosadoOS dispatch failed (HTTP ${response.status}). Check the scoped token and repository access; no deployment has been requested successfully.`);
console.log(`Requested RosadoOS validation for WebTools ${sha}. Hostinger publication is conditional on combined validation.`);
