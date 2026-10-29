// Where admin edits are saved. With GITHUB_TOKEN (Vercel): one commit on the branch through GitHub's Git Data
// API, and Vercel redeploys. Without it (local): files written into the working folder, then the site rebuilt.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const KINDS = ['events', 'news', 'tenders'];
const dataPath = (kind) => `src/data/outreach/${kind}.json`;
const fail = (status, message) => Object.assign(new Error(message), { status });

class LocalStore {
  constructor(root, { build = true } = {}) { this.root = path.resolve(root); this.build = build; }
  async read() {
    return Object.fromEntries(KINDS.map((k) => [k, JSON.parse(fs.readFileSync(path.join(this.root, dataPath(k)), 'utf8'))]));
  }
  async write({ files }) {
    for (const f of files) {
      const out = path.resolve(this.root, f.path);
      if (!out.startsWith(this.root + path.sep)) throw fail(400, 'Bad file path.');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, f.content);
    }
    if (!this.build) return;
    const r = spawnSync(process.execPath, ['tools/build.cjs'], { cwd: this.root, encoding: 'utf8' });
    if (r.status !== 0) throw fail(500, 'Saved, but the site did not rebuild: ' + (r.stderr || '').split('\n')[0]);
  }
}

class GitHubStore {
  constructor({ token, repo, branch }) { Object.assign(this, { token, repo, branch }); }
  async api(method, p, body, accept = 'application/vnd.github+json') {
    const r = await fetch(`https://api.github.com/repos/${this.repo}/${p}`, {
      method,
      headers: { Authorization: `Bearer ${this.token}`, Accept: accept, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'artpark-admin', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      throw fail(method === 'PATCH' && (r.status === 422 || r.status === 409) ? 409 : 502, `GitHub ${method} ${p}: ${r.status} ${detail.slice(0, 200)}`);
    }
    return r.json();
  }
  // Reads all three files at one commit and remembers it, so write() builds on exactly what was read;
  // if the branch moved in between, the ref update is not a fast-forward and the caller retries.
  async read() {
    this.head = (await this.api('GET', `git/ref/heads/${this.branch}`)).object.sha;
    const out = {};
    for (const k of KINDS) out[k] = await this.api('GET', `contents/${dataPath(k)}?ref=${this.head}`, null, 'application/vnd.github.raw+json');
    return out;
  }
  async write({ files, message }) {
    const head = this.head || (await this.api('GET', `git/ref/heads/${this.branch}`)).object.sha;
    const baseTree = (await this.api('GET', `git/commits/${head}`)).tree.sha;
    const tree = [];
    for (const f of files) {
      const blob = await this.api('POST', 'git/blobs', { content: Buffer.from(f.content).toString('base64'), encoding: 'base64' });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await this.api('POST', 'git/trees', { base_tree: baseTree, tree });
    const commit = await this.api('POST', 'git/commits', { message, tree: newTree.sha, parents: [head] });
    await this.api('PATCH', `git/refs/heads/${this.branch}`, { sha: commit.sha, force: false });
  }
}

function getStore() {
  if (process.env.GITHUB_TOKEN) {
    return new GitHubStore({ token: process.env.GITHUB_TOKEN, repo: process.env.GITHUB_REPO || 'uditauniyal/artpark.in', branch: process.env.GITHUB_BRANCH || 'main' });
  }
  return new LocalStore(process.env.ARTPARK_ROOT || path.join(__dirname, '..', '..'), { build: !process.env.ARTPARK_SKIP_BUILD });
}

module.exports = { KINDS, dataPath, LocalStore, GitHubStore, getStore };
