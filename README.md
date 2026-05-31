# Josephine Alinea's Personal Website

A personal portfolio site built with Jekyll and published to GitHub Pages.

## Prerequisites

You need Ruby and Bundler installed before anything else.

⚠️ If Ruby is pre-installed — use a version manager so you don't run into system permission issues.

<details>
<summary><strong>macOS</strong></summary>

#### Install Homebrew if you don't have it
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
#### Install rbenv (Ruby version manager)
```bash
brew install rbenv ruby-build
```
#### Add rbenv to your shell (then restart your terminal)
```bash
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
```
#### Install Ruby 3.3
```bash
rbenv install 3.3.0
```
#### Set it as the default
```bash
rbenv global 3.3.0
```
#### Verify
```bash
ruby --version   # should show 3.3.0
```
#### Install Bundler
```bash
gem install bundler
```

</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

#### Install rbenv dependencies
```bash
sudo apt-get update && sudo apt-get install -y git curl libssl-dev libreadline-dev zlib1g-dev
```
#### Install rbenv
```bash
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash
```
#### Add rbenv to your PATH
```bash
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
```
#### Add rbenv init to your shell (then restart your terminal)
```bash
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
```
#### Install Ruby 3.3
```bash
rbenv install 3.3.0
```
#### Set it as the default
```bash
rbenv global 3.3.0
```
#### Verify
```bash
ruby --version   # should show 3.3.0
```
#### Install Bundler
```bash
gem install bundler
```

</details>

<details>
<summary><strong>Windows</strong></summary>

#### Install Ruby via RubyInstaller
Download the **Ruby+Devkit 3.3.x (x64)** installer from [rubyinstaller.org](https://rubyinstaller.org/), run it, and make sure to tick **"Add Ruby executables to your PATH"**. Restart your terminal after installation.

#### Verify
```bash
ruby --version   # should show 3.3.x
```
#### Install Bundler
```bash
gem install bundler
```

</details>

---

## Quick Start

Once Ruby and Bundler are installed, run these commands.

#### Clone the repository
```bash
git clone https://github.com/josephinealinea/josephinealinea.github.io.git
```
#### Navigate into the project folder
```bash
cd josephinealinea.github.io
```
#### Install project dependencies (only needed once, or after Gemfile changes)
```bash
bundle install
```
#### Start the local dev server
```bash
bundle exec jekyll serve
```
#### Open in your browser
```
http://localhost:4000
```

#### Network access (optional — to test on a phone or other device)
```bash
bundle exec jekyll serve --host 0.0.0.0 --port 4000
```

---

## Development

### File Structure

```
josephinealinea.github.io/
├── _config.yml              # Site configuration and chatbot settings
├── _includes/
│   ├── sections/            # Page section partials (welcome, about, skills, posts, contact)
│   ├── chatbot.html         # Keyword-matching chatbot widget
│   ├── header.html
│   └── footer.html
├── _layouts/
│   ├── default.html         # Wraps every page
│   └── post.html            # Wraps blog posts
├── _posts/                  # Blog posts (YYYY-MM-DD-slug.md)
├── assets/
│   ├── main.scss            # Primary stylesheet (Minima theme + custom CSS)
│   ├── retro-game.scss      # Alternate Retro-Game theme
│   └── js/theme-selector.js # Theme switching logic
└── index.html               # Single-page homepage
```

### Adding New Posts

Create a file in `_posts/` named `YYYY-MM-DD-your-slug.md`:

```markdown
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS
categories: [category1, category2]
---

Your post content here...
```

### Customizing

- **Site settings / chatbot:** Edit `_config.yml`
- **Styling:** Modify `assets/main.scss`
- **Page sections:** Edit files in `_includes/sections/`
- **Layouts:** Customize templates in `_layouts/`

### Theme Selector

A floating theme selector sits in the top-right corner with two options:
- **Jekyll Minima** (default) — clean, modern design
- **Retro-Game** — neon colors and pixel fonts

---

## Troubleshooting

### `bundle install` fails

Make sure you installed Ruby via rbenv (not the system Ruby). Run `ruby --version` — if it shows `/usr/bin/ruby` as the path, your shell isn't picking up rbenv yet. Restart your terminal or re-run `eval "$(rbenv init -)"`.

### Port already in use

#### Kill any existing Jekyll process
```bash
pkill -f jekyll
```
#### Or use a different port
```bash
bundle exec jekyll serve --port 4001
```

### Sass deprecation warnings on startup

You will see a wall of `DEPRECATION WARNING` messages about `@import` and color functions when starting the server. These come from the Minima theme gem (not your code) and are **harmless** — the site builds and runs correctly. You can safely ignore them.

### Permission errors on `gem install`

You are likely using the system Ruby. Switch to rbenv-managed Ruby (see Prerequisites above) — never use `sudo gem install`.

---

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages](https://pages.github.com/)
- [rbenv](https://github.com/rbenv/rbenv)