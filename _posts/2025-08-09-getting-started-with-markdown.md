---
layout: post
title:  "Getting Started with Markdown"
date:   2025-08-09 14:30:00 +0000
categories: markdown tutorial
---

Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. Created by John Gruber in 2004, Markdown is now one of the world's most popular markup languages.

## Why Use Markdown?

- **Easy to learn**: The syntax is straightforward and memorable
- **Portable**: Files containing Markdown-formatted text can be opened using virtually any application
- **Platform independent**: You can create Markdown-formatted text on any device running any operating system
- **Future proof**: Even if the application you're using stops working at some point in the future, you'll still be able to read your text using a text editing application

## Basic Syntax

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Emphasis
```markdown
*Italic text*
**Bold text**
***Bold and italic***
```

### Lists
```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Second item
3. Third item
```

### Links and Images
```markdown
[Link text](URL)
![Alt text](image-url)
```

### Code
```markdown
`inline code`
```

```python
# Code block
def hello_world():
    print("Hello, World!")
```

## Writing Blog Posts

To create a new blog post in Jekyll:

1. Create a new file in the `_posts` directory
2. Name it with the format: `YYYY-MM-DD-title.md`
3. Add front matter at the top:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD HH:MM:SS +0000
   categories: category1 category2
   ---
   ```
4. Write your content in Markdown below the front matter

That's it! Jekyll will automatically generate your blog post with the proper formatting and styling.
