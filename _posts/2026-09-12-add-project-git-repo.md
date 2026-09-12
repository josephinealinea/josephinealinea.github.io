---
layout: post
title: "[GIT] Adding your project to Git repo"
date: 2026-09-12 09:00:00 +0000
categories: [git, setup]
tags: [git, ssh, github, setup]
---

After creating your project locally, add them to Git repo.

Note: A pre-requisite GitHub account is required. If you haven't set up Git identity or SSH keys yet, check out [Setting Up Git (and MCP?) on a New Laptop]({% post_url 2026-06-04-setting-up-git-config %}) first.

---

## 1. Initialize Git in Your Project

Navigate to your project folder and turn it into a Git repository:

#### Initialize a new Git repo
```bash
git init
```

---

## 2. Stage and Commit Your Files

#### Check what will be added
```bash
git status
```

#### Stage all files
```bash
git add .
```

#### Create your first commit
```bash
git commit -m "Initial commit"
```

---

## 3. Create a Repository on GitHub

Go to [github.com/new](https://github.com/new) and create a new, empty repository. Don't initialize it with a README, `.gitignore`, or license if you're pushing an existing local project — that avoids conflicting histories.

---

## 4. Link Your Local Repo to GitHub

GitHub will show you a remote URL after creating the repo. Use the SSH version if you've already set up an SSH key, or HTTPS otherwise.

#### Add the GitHub repo as a remote (SSH)
```bash
git remote add origin git@github.com:username/repo-name.git
```

#### Add the GitHub repo as a remote (HTTPS)
```bash
git remote add origin https://github.com/username/repo-name.git
```

#### Verify the remote was added
```bash
git remote -v
```

---

## 5. Push Your Code

#### Rename your branch to main (if needed)
```bash
git branch -M main
```

#### Push and set upstream tracking
```bash
git push -u origin main
```

---

## 6. Verify

Refresh the repo page on GitHub — your files should now be there. Future pushes only need:

#### Push subsequent commits
```bash
git push
```

---

That's it — your local project is now backed by a GitHub repo, and every commit you make can be pushed up with a single command.
