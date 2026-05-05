# How to Push Updated Code to GitHub

## Quick Steps (If Repository Already Exists)

```bash
# 1. Check current status
git status

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "Updated features: advisor students view, document viewer, media browser, etc."

# 4. Push to GitHub
git push origin main
```

---

## Detailed Step-by-Step Guide

### Step 1: Check Git Status
```bash
git status
```
This shows:
- Modified files (red)
- New files (red)
- Staged files (green)

### Step 2: Add Files to Staging

**Option A: Add all changes**
```bash
git add .
```

**Option B: Add specific files**
```bash
git add Frontend/src/pages/department/Advisors.jsx
git add Frontend/src/components/uil/DocumentViewer.jsx
git add Backend/apps/core/views.py
# ... etc
```

**Option C: Add by folder**
```bash
git add Frontend/
git add Backend/
```

### Step 3: Commit Changes

**Basic commit:**
```bash
git commit -m "Your commit message here"
```

**Detailed commit message:**
```bash
git commit -m "Feature updates and bug fixes

- Added advisor students view page
- Implemented document viewer with button-only opening
- Created custom styled media browser
- Removed advisor performance graph
- Removed live session from advisor dashboard
- Fixed department context error
- Updated advisor page styling"
```

### Step 4: Push to GitHub

**If you're on the main branch:**
```bash
git push origin main
```

**If you're on master branch:**
```bash
git push origin master
```

**If you're on a different branch:**
```bash
git push origin your-branch-name
```

---

## First Time Setup (If Not Connected to GitHub)

### 1. Check if Git is initialized
```bash
git status
```

If you see "not a git repository", initialize:
```bash
git init
```

### 2. Check remote repository
```bash
git remote -v
```

If no remote exists, add it:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 3. Set your Git identity (if not set)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4. Create initial commit
```bash
git add .
git commit -m "Initial commit"
```

### 5. Push to GitHub
```bash
# For new repository
git push -u origin main

# Or if using master branch
git push -u origin master
```

---

## Common Scenarios

### Scenario 1: Push to Existing Repository
```bash
git add .
git commit -m "Updated features"
git push origin main
```

### Scenario 2: Create New Branch for Features
```bash
# Create and switch to new branch
git checkout -b feature/advisor-updates

# Add and commit changes
git add .
git commit -m "Added advisor features"

# Push new branch to GitHub
git push -u origin feature/advisor-updates
```

### Scenario 3: Update from Remote Before Pushing
```bash
# Pull latest changes first
git pull origin main

# Then add, commit, and push
git add .
git commit -m "Your message"
git push origin main
```

### Scenario 4: Force Push (Use with Caution!)
```bash
# Only if you're sure and working alone
git push -f origin main
```

---

## Handling Conflicts

If you get a conflict error:

```bash
# 1. Pull the latest changes
git pull origin main

# 2. Resolve conflicts in your editor
# (Git will mark conflicts in files with <<<<<<, =======, >>>>>>>)

# 3. After resolving, add the files
git add .

# 4. Commit the merge
git commit -m "Resolved merge conflicts"

# 5. Push
git push origin main
```

---

## Useful Git Commands

### Check Status
```bash
git status                    # See what's changed
git log                       # See commit history
git log --oneline            # Compact commit history
git diff                     # See changes before staging
```

### Undo Changes
```bash
git restore filename         # Undo changes to a file
git restore .               # Undo all changes
git reset HEAD~1            # Undo last commit (keep changes)
git reset --hard HEAD~1     # Undo last commit (discard changes)
```

### Branch Management
```bash
git branch                   # List branches
git branch -a               # List all branches (including remote)
git checkout branch-name    # Switch to branch
git checkout -b new-branch  # Create and switch to new branch
git branch -d branch-name   # Delete branch
```

### Remote Management
```bash
git remote -v               # Show remote URLs
git remote add origin URL   # Add remote
git remote set-url origin URL  # Change remote URL
```

---

## Best Practices

### 1. Commit Often
```bash
# Good: Small, focused commits
git commit -m "Fixed advisor students view bug"
git commit -m "Added document viewer button"
git commit -m "Updated styling for media browser"

# Bad: One huge commit
git commit -m "Fixed everything"
```

### 2. Write Clear Commit Messages
```bash
# Good
git commit -m "Fix: Resolved department context JSON parse error"
git commit -m "Feature: Added custom media browser with styled UI"
git commit -m "Update: Removed advisor performance graph from dashboard"

# Bad
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

### 3. Check Before Pushing
```bash
# Always check what you're about to push
git status
git diff --staged
git log --oneline -5
```

### 4. Don't Commit Sensitive Files
Make sure `.gitignore` includes:
```
# Python
*.pyc
__pycache__/
*.env
.venv/
venv/

# Node
node_modules/
.env
.env.local

# Database
*.sqlite3
db.sqlite3

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## Quick Reference Card

```bash
# Daily workflow
git status                          # Check status
git add .                          # Stage all changes
git commit -m "Your message"       # Commit changes
git push origin main               # Push to GitHub

# Branch workflow
git checkout -b feature-name       # Create new branch
git add .                          # Stage changes
git commit -m "Feature description" # Commit
git push -u origin feature-name    # Push branch

# Update from remote
git pull origin main               # Pull latest changes
git fetch origin                   # Fetch without merging

# Undo mistakes
git restore filename               # Undo file changes
git reset HEAD~1                   # Undo last commit
git revert commit-hash            # Revert specific commit
```

---

## Troubleshooting

### Error: "fatal: not a git repository"
```bash
git init
git remote add origin YOUR_REPO_URL
```

### Error: "Permission denied (publickey)"
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/USERNAME/REPO.git
```

### Error: "Updates were rejected"
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### Error: "Your branch is behind"
```bash
git pull origin main
# Resolve any conflicts
git push origin main
```

---

## GitHub Desktop Alternative

If you prefer a GUI:

1. Download **GitHub Desktop**: https://desktop.github.com/
2. Open your project folder
3. Review changes in the UI
4. Write commit message
5. Click "Commit to main"
6. Click "Push origin"

---

## Summary for Your Current Project

Based on the changes we made today:

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit with descriptive message
git commit -m "Major updates: advisor features, document viewer, media browser

- Added advisor students view with clickable names
- Implemented document viewer with manual open button
- Created custom styled media browser for /media/ directory
- Removed advisor performance graph from advisors page
- Removed live session feature from advisor dashboard
- Fixed department context JSON parse error
- Updated URL routes for advisor students endpoint
- Improved error handling and user experience"

# 4. Push to GitHub
git push origin main
```

---

## Need Help?

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Remember:** Always commit and push your changes regularly to avoid losing work!
