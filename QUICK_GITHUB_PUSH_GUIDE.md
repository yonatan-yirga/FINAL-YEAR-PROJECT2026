# Quick GitHub Push Guide

## Simple 3-Step Process

### Step 1: Stage Your Changes
```bash
git add .
```
This adds all modified and new files.

### Step 2: Commit with Message
```bash
git commit -m "Your commit message here"
```
Write a clear message describing what you changed.

### Step 3: Push to GitHub
```bash
git push origin main
```
This uploads your changes to GitHub.

---

## Detailed Commands

### Check What Changed
```bash
git status
```
Shows which files were modified, added, or deleted.

### View Changes in Files
```bash
git diff
```
Shows the actual code changes.

### Stage Specific Files Only
```bash
git add file1.js file2.py
```
Add only specific files instead of everything.

### Commit with Detailed Message
```bash
git commit -m "Short summary

Detailed description:
- Feature 1
- Feature 2
- Bug fix 3"
```

### View Commit History
```bash
git log --oneline -5
```
Shows last 5 commits.

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```
Undoes the commit but keeps your changes.

### Undo Changes to a File
```bash
git restore filename.js
```
Discards changes to a specific file.

---

## Common Scenarios

### Scenario 1: Push New Feature
```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with message
git commit -m "Add new feature: user profile page"

# 4. Push to GitHub
git push origin main
```

### Scenario 2: Fix a Bug
```bash
git add .
git commit -m "Fix: resolve login authentication issue"
git push origin main
```

### Scenario 3: Update Documentation
```bash
git add .
git commit -m "Docs: update README with installation instructions"
git push origin main
```

### Scenario 4: Multiple Changes
```bash
git add .
git commit -m "Update: landing page improvements

- Add auto-refresh feature
- Fix caching issues
- Improve loading states
- Add debugging tools"
git push origin main
```

---

## Best Practices

### Good Commit Messages
✅ **Good**:
- "Fix: resolve company visibility on landing page"
- "Add: auto-refresh feature for landing page"
- "Update: improve error handling in API calls"
- "Docs: add troubleshooting guide"

❌ **Bad**:
- "fix"
- "update"
- "changes"
- "asdf"

### Commit Message Format
```
Type: Short summary (50 chars or less)

Detailed description if needed:
- What was changed
- Why it was changed
- How it affects the system
```

**Types**:
- `Fix:` - Bug fixes
- `Add:` - New features
- `Update:` - Improvements to existing features
- `Remove:` - Removed features
- `Docs:` - Documentation changes
- `Style:` - Code formatting (no logic change)
- `Refactor:` - Code restructuring (no behavior change)
- `Test:` - Adding or updating tests

---

## Troubleshooting

### Problem: "Permission denied"
**Solution**: Check your GitHub credentials
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Problem: "Rejected - non-fast-forward"
**Solution**: Pull first, then push
```bash
git pull origin main
git push origin main
```

### Problem: "Merge conflict"
**Solution**: Resolve conflicts manually
```bash
# 1. Pull latest changes
git pull origin main

# 2. Open conflicted files and resolve
# Look for <<<<<<< HEAD markers

# 3. After resolving, add and commit
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Problem: "Accidentally committed wrong files"
**Solution**: Undo last commit
```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Remove unwanted files
git restore unwanted-file.txt

# Commit again
git add .
git commit -m "Correct commit message"
git push origin main
```

---

## Useful Git Commands

### View Remote Repository
```bash
git remote -v
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create New Branch
```bash
git checkout -b feature-name
```

### Switch Branch
```bash
git checkout main
```

### Merge Branch
```bash
git checkout main
git merge feature-name
```

### Delete Branch
```bash
git branch -d feature-name
```

### View All Branches
```bash
git branch -a
```

### Stash Changes (Save for Later)
```bash
git stash
git stash pop  # Restore later
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Check what changed |
| `git add .` | Stage all changes |
| `git add file.js` | Stage specific file |
| `git commit -m "message"` | Commit changes |
| `git push origin main` | Push to GitHub |
| `git pull origin main` | Pull from GitHub |
| `git log --oneline` | View commit history |
| `git diff` | View changes |
| `git restore file.js` | Undo changes to file |
| `git reset --soft HEAD~1` | Undo last commit |

---

## Your Repository

**URL**: https://github.com/yonatan-yirga/FINAL-YEAR-PROJECT2026
**Branch**: main

---

## Example Workflow

```bash
# 1. Make changes to your code
# ... edit files ...

# 2. Check what changed
git status

# 3. Stage changes
git add .

# 4. Commit with message
git commit -m "Add new feature: company directory page"

# 5. Push to GitHub
git push origin main

# 6. Verify on GitHub
# Visit: https://github.com/yonatan-yirga/FINAL-YEAR-PROJECT2026
```

---

## Tips

1. **Commit often**: Small, frequent commits are better than large ones
2. **Write clear messages**: Future you will thank you
3. **Pull before push**: Always pull latest changes first
4. **Test before commit**: Make sure your code works
5. **Don't commit secrets**: Never commit passwords, API keys, etc.

---

## Need Help?

- Check `HOW_TO_PUSH_TO_GITHUB.md` for detailed guide
- Check `GITHUB_PUSH_SUCCESS.md` for latest push details
- Visit: https://docs.github.com/en/get-started
