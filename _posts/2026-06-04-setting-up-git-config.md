---
layout: post
title: "[GIT] Setting Up Git (and MCP?) on a New Laptop"
date: 2026-06-04 09:00:00 +0000
categories: [git, setup, mcp]
tags: [git, ssh, github, setup, mcp]
---

**Some background story**: I tried to put myself in the open and practice pair-programming. I recently got a new laptop and before the meeting, I installed my tools, cloned a public repo, pushed a commit in my own repo — everything worked. 

Then came the pair-programming session.

Turns out, cloning a *private* repo is a completely different vibe when your SSH key or access token doesn't exist yet. Thirty minutes evaporated. I couldn't clone the repo. I couldn't share my screen. I could, however, contribute a very long and uncomfortable silence. Murphy's Law (1.0): *"Anything that can go wrong will go wrong"* — and Murphy apparently also does code reviews.

So, future me (and maybe you): here are the commands to get Git properly set up from day one so this never happens again.

**Bonus:** I also threw in how to connect your GitHub in Claude Code MCP, because why not over-prepare this time.

🚧
Getting Git working properly on a fresh machine takes more than just installing it. 

This guide walks you through identity config, SSH key setup, and cloning both public and private repositories — via SSH or HTTPS.

---

## 1. Install Git

Check if Git is already installed:

#### Check Git version
```bash
git --version
```

If it's not installed, on macOS run:

#### Install Git via Homebrew
```bash
brew install git
```

---

## 2. Configure Your Identity

These values are attached to every commit you make.

#### Set your name
```bash
git config --global user.name "Your Name"
```

#### Set your email
```bash
git config --global user.email "you@example.com"
```

#### Set default branch name to main
```bash
git config --global init.defaultBranch main
```

---

## 3. Generate an SSH Key

Use your GitHub email as the label.

#### Generate an ed25519 SSH key
```bash
ssh-keygen -t ed25519 -C "you@example.com"
```

When prompted, press Enter to accept the default file location (`~/.ssh/id_ed25519`). You can also set a passphrase for extra security.

---

## 4. Add the Key to the SSH Agent

#### Start the SSH agent
```bash
eval "$(ssh-agent -s)"
```

#### Add your private key to the agent
```bash
ssh-add ~/.ssh/id_ed25519
```

---

## 5. Add Your Public Key to GitHub

Copy your public key to the clipboard:

#### Copy public key (macOS)
```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

#### Print public key (Linux / no pbcopy)
```bash
cat ~/.ssh/id_ed25519.pub
```

Then in GitHub, go to **Settings → SSH and GPG keys → New SSH key**, paste the key, and save.

---

## 6. Test Your SSH Connection

#### Test SSH connection to GitHub
```bash
ssh -T git@github.com
```

A successful response looks like:

```
Hi your-username! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 7. Clone a Public Repository

Public repos don't require authentication. Use HTTPS:

#### Clone a public repo via HTTPS
```bash
git clone https://github.com/username/repo.git
```

---

## 8. Clone a Private Repository

### Via SSH

Once your SSH key is added to GitHub, use the SSH URL:

#### Clone a private repo via SSH
```bash
git clone git@github.com:username/private-repo.git
```

### Via HTTPS with a Personal Access Token (PAT)

GitHub no longer accepts your account password over HTTPS. You need a **Personal Access Token (PAT)**.

To generate one: **GitHub → Settings → Developer settings → Personal access tokens → Generate new token**. Give it `repo` scope.

Then clone using the token in the URL:

#### Clone a private repo via HTTPS with a PAT
```bash
git clone https://<your-token>@github.com/username/private-repo.git
```

Or clone normally and enter your username and PAT when prompted:

#### Clone a private repo via HTTPS (prompted)
```bash
git clone https://github.com/username/private-repo.git
```

### Cache your credentials so you're not prompted every time

On macOS, use the keychain:

#### Use macOS keychain for credential storage
```bash
git config --global credential.helper osxkeychain
```

On Linux or other platforms:

#### Cache credentials in memory (15 minutes)
```bash
git config --global credential.helper cache
```

#### Store credentials on disk (persistent)
```bash
git config --global credential.helper store
```

---

## 9. Verify Your Config

Check everything you've set:

#### List all Git config values
```bash
git config --list
```

Your output should include entries for `user.name`, `user.email`, `init.defaultBranch`, `core.editor`, and `credential.helper`.

---

## 10. Connect GitHub to Claude Code via MCP

Claude Code supports MCP (Model Context Protocol), which lets it talk directly to GitHub — browsing repos, reading issues, creating PRs, and more without leaving the terminal.

You'll need a GitHub Personal Access Token (PAT) from Step 8. Give it at least `repo` scope.

There are two ways to add it. Pick one.

---

### Option A — via the CLI (quick)

#### Add the GitHub MCP server to Claude Code
```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=your_token -- npx -y @modelcontextprotocol/server-github
```

Replace `your_token` with your actual PAT.

---

### Option B — via `~/.claude.json` (more control)

This approach keeps your token out of shell history and lets you manage MCP servers directly in config.

**Step 1** — store your PAT as an environment variable in `.zshrc`:

#### Add PAT to .zshrc
```bash
echo 'export GITHUB_PERSONAL_ACCESS_TOKEN=your_token' >> ~/.zshrc
```

#### Reload .zshrc
```bash
source ~/.zshrc
```

**Step 2** — open `~/.claude.json` and add the `mcpServers` block. If the file already has content, merge this in:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

The `${GITHUB_PERSONAL_ACCESS_TOKEN}` reference picks up the value from your shell environment, so the token never lives in the JSON file itself.

---

#### Verify the MCP server was added
```bash
claude mcp list
```

You should see `github` listed. Once it's there, Claude Code can interact with GitHub on your behalf — search repos, read issues, open PRs — all from within the chat.

---

### Lock it down — deny push operations

By default, the GitHub MCP can read *and* write to your repos. If you only want Claude Code to browse and read — never push — add a `permissions` block to `~/.claude.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  },
  "permissions": {
    "deny": [
      "mcp__github__push_files",
      "mcp__github__create_or_update_file",
      "mcp__github__merge_pull_request",
      "mcp__github__create_repository",
      "mcp__github__fork_repository"
    ]
  }
}
```

The `mcp__github__<tool>` pattern maps directly to each MCP tool by name. Any tool listed under `deny` will be blocked — Claude Code will refuse to call it even if asked. This gives you a read-only GitHub integration that can't touch your code.

---

That's it — your Git setup is ready. Whether you're working with public repos over HTTPS or private repos over SSH or token-authenticated HTTPS, you're covered. And with the GitHub MCP wired up, Claude Code has full context of your repos too.
