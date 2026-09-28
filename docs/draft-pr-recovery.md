# Non-destructive draft pull request recovery

Use this checklist when the working tree is already in the desired state but the
current checkout has no configured Git remote or GitHub authentication. It keeps
the existing files and build artifacts intact; do not clean, reset, or rebuild the
project merely to publish the branch.

## Diagnose before changing anything

```bash
git status --short --branch
git branch -vv
git remote -v
gh auth status
```

Record the current branch and commit before attempting to publish it. If
`git remote -v` is empty, the repository needs a remote URL; if `gh auth status`
fails, authenticate with a GitHub account that can write to the repository.

## Publish the existing branch safely

After obtaining the repository URL and authenticating, add the missing remote
without touching the working tree:

```bash
git remote add origin <repository-url>
git push --set-upstream origin HEAD
```

If `origin` exists but points to the wrong repository, preserve its current value
before changing it:

```bash
git remote get-url origin
git remote set-url origin <repository-url>
git push --set-upstream origin HEAD
```

Create the pull request as a draft after the push succeeds:

```bash
gh pr create --draft --fill --head "$(git branch --show-current)"
```

When a platform-provided pull-request tool is available, it can record the title
and body after the commit even if the local checkout has no GitHub credentials.
This is preferable to deleting files, running `git clean`, resetting the branch,
or rebuilding the application to work around a publication-only problem.
