# Josephine Alinea's Personal Website

Welcome to my personal website built with Jekyll! This is a clean, modern site that showcases my work and thoughts.

## 🚀 Quick Start

### Option 1: One-Click Start (Recommended)
Click this link to open your site in the browser:
**[http://localhost:4000](http://localhost:4000)**

### Option 2: Manual Start
If the link above doesn't work, follow these steps:

1. **Open Terminal** (⌘ + Space, type "Terminal")
2. **Navigate to project folder:**
   ```bash
   cd /Users/maiajosipin-mac/Documents/GeekPOC/josephinealinea.github.io
   ```
3. **Start Jekyll server:**
   ```bash
   jekyll serve --host 0.0.0.0 --port 4000
   ```
4. **Open in browser:** [http://localhost:4000](http://localhost:4000)

## 🛠️ Development

### Prerequisites
- Ruby (already installed)
- Jekyll 4.2.2 (already installed)
- Bundler (for gem management)

### File Structure
```
josephinealinea.github.io/
├── _config.yml          # Site configuration
├── _includes/           # Reusable HTML components
│   ├── header.html      # Site header with navigation
│   ├── footer.html      # Site footer
│   └── theme-selector.html  # Theme switching component
├── _layouts/            # Page templates
├── _posts/              # Blog posts
├── assets/              # CSS, JS, images
│   ├── main.scss        # Jekyll Minima theme (default)
│   └── retro-game.scss  # Retro-Game theme
├── about.md             # About page
└── index.html           # Homepage
```

### Adding New Posts
Create new markdown files in `_posts/` with the format:
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
- **Theme:** Edit `_config.yml` to change site settings
- **Styling:** Modify `assets/main.scss` for custom CSS
- **Layouts:** Customize templates in `_layouts/`
- **Components:** Add reusable HTML in `_includes/`

### 🎨 Theme Selector
Your site now includes a **floating theme selector** in the top right corner:
- **Jekyll Minima** (Default): Clean, modern design
- **Retro-Game**: Nostalgic gaming aesthetic with neon colors and pixel fonts

Click the 🎨 button to switch between themes instantly!

## 🌐 Access Your Site

- **Local Development:** [http://localhost:4000](http://localhost:4000)
- **Network Access:** [http://YOUR_IP:4000](http://YOUR_IP:4000) (for testing on other devices)

## 📝 Current Status

✅ **Server Status:** Running on port 4000  
✅ **Site Accessible:** [http://localhost:4000](http://localhost:4000)  
✅ **Jekyll Version:** 4.2.2  
✅ **Ruby Version:** 3.0.0  

## 🚨 Troubleshooting

### Server Won't Start?
```bash
# Check if Jekyll is installed
jekyll --version

# Install dependencies
bundle install

# Start server with verbose output
jekyll serve --verbose
```

### Port Already in Use?
```bash
# Kill existing Jekyll processes
pkill -f jekyll

# Or use a different port
jekyll serve --port 4001
```

### Permission Issues?
```bash
# Fix gem permissions
sudo chown -R $(whoami) ~/.gem
```

## 📚 Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Jekyll Themes](https://jekyllthemes.io/)
- [GitHub Pages](https://pages.github.com/)

---

**Happy coding! 🎉**

*Last updated: $(date)*
