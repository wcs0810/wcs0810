---
name: "github-project-submit"
description: "Submits the local project to a GitHub repository via git commit and push over SSH using the existing user SSH key. Invoke when the user wants to commit and push this project to GitHub (default target https://github.com/wcs0810/wcs0810.git)."
---

# GitHub Project Submit

Commits the current workspace and pushes it to a GitHub repository using SSH authentication with the local key (`~/.ssh/id_ed25519`). No token is needed and no credentials are written into committed files.

## When to Invoke

- User asks to commit and push this project to GitHub.
- User provides a GitHub repository URL (default: `https://github.com/wcs0810/wcs0810.git`).
- User says to use the already-configured SSH public key.

## Preconditions

- An SSH key pair exists; if not, create one:
  `ssh-keygen --% -t ed25519 -C "<git user.email>" -f "C:\Users\ROG\.ssh\id_ed25519" -N ""`
- The public key (`~/.ssh/id_ed25519.pub`) is added to the GitHub account (Settings → SSH and GPG keys).
- `git config --global user.name` / `user.email` are set.

## Workflow

1. **Inspect state**
   - `git status` and `git remote -v` to see pending changes and existing remotes.
   - `git log --oneline -5` to match the repository's commit message style.

2. **Prepare SSH trust**
   - Add GitHub host fingerprint to known_hosts (avoids interactive prompt):
     `ssh-keyscan github.com | Add-Content "$env:USERPROFILE\.ssh\known_hosts"`
   - Verify: `ssh -T git@github.com` (expected "successfully authenticated", exit code 1).

3. **Stage and commit**
   - Stage the project, excluding secrets (`.env`, tokens, credentials):
     `git add -A`
   - Create a NEW commit (never amend):
     ```powershell
     git commit -m "$(cat <<'EOF'
     <concise message describing why>
     EOF
     )"
     ```

4. **Add GitHub remote**
   - Use a separate remote name so an existing Gitee origin stays intact:
     `git remote add github https://github.com/wcs0810/wcs0810.git`
     (or `git remote set-url github <url>` if it already exists; confirm with `git remote -v`).

5. **Push**
   - `git push -u github master` (use `main` if that is the remote default branch).
   - If the remote already has unrelated history, report it and ask the user before any `--force`.

## Important Notes

- Never commit secrets: skip `.env`, token files, and files containing credentials.
- Never use `git push --force` unless the user explicitly requests it.
- Keep the existing `origin` (Gitee) untouched; push through the dedicated `github` remote.
- Do not rewrite history; always create new commits.
- **Network fallback**: this machine cannot reach GitHub over SSH (port 22 refused, `ssh.github.com:443` timed out). When SSH fails, keep the HTTPS URL and rely on the credentials already stored in Windows Credential Manager (`git:https://github.com`, user `wcs0810`), then push with `GIT_TERMINAL_PROMPT=0` so it never blocks on input.

## Example

User: "把本项目提交并推送到 GitHub"

```powershell
git status
ssh-keyscan github.com | Add-Content "$env:USERPROFILE\.ssh\known_hosts"

git add -A
git commit -m "Update coursework pages and add GitHub submit skill"

git remote add github https://github.com/wcs0810/wcs0810.git
git push -u github master
```
