---
name: "gitee-project-submit"
description: "Submits local project files to a Gitee repository via git commit and push. Invoke when user wants to submit/push a project to Gitee, create a student folder, or commit and push to a Gitee remote with a private token."
---

# Gitee Project Submit

This skill submits a local web design project to a Gitee repository. It organizes project files into a named folder, initializes/configures git, commits, and pushes to the Gitee remote using a private token.

## When to Invoke

- User asks to submit/push a local project to a Gitee repository.
- User wants to create a named folder (e.g. student ID + name) and push the project into it.
- User provides a Gitee repository URL and private token for authentication.

## Workflow

1. **Organize project files**
   - Create a folder named as the user specifies (e.g. `810王传淞`) at the workspace root.
   - Move the project's HTML/CSS/JS files into that folder so the repository keeps per-student subdirectories.

2. **Initialize git (if needed)**
   - `git init` in the workspace root (skip if `.git` already exists).
   - Configure user name/email if not already set:
     - `git config user.name "<name>"`
     - `git config user.email "<email>"`

3. **Stage and commit**
   - `git add <folder>` (stage the named folder; avoid staging secrets).
   - `git commit -m "<descriptive message>"` using a HEREDOC for clean formatting.

4. **Add remote and push**
   - Build the authenticated remote URL by inserting the token:
     `https://oauth2:<token>@gitee.com/<user>/<repo>.git`
   - `git remote add origin <url>` (or `git remote set-url origin <url>` if origin exists).
   - `git push -u origin master` (or `main` depending on the repo's default branch).

## Important Notes

- **Never commit secrets**: do not stage `.env`, token files, or credentials.
- **Token handling**: embed the token in the remote URL only for the push; avoid writing it into committed files.
- Use the repository's default branch. If `master` is rejected, try `main`.
- Prefer staging the specific project folder over `git add .` to avoid including unwanted files.
- Create NEW commits; do not amend previous commits.
- Do not push with `--force` unless the user explicitly requests it.

## Example

User wants to push the advanced web design project into folder `810王传淞` of repo `webdesign004project`:

```powershell
# 1. organize
New-Item -ItemType Directory -Force -Path "810王传淞"
Move-Item index.html, HTML_basic_001.html, html_basic.css "810王传淞\"

# 2. git init + configure
git init
git config user.name "wangyao"
git config user.email "wangyao@neusoft.edu.cn"

# 3. commit
git add 810王传淞
git commit -m "Add 810王传淞 advanced web design project"

# 4. push
git remote add origin https://oauth2:<token>@gitee.com/neusoft_wangyao_jsj/webdesign004project.git
git push -u origin master
```
