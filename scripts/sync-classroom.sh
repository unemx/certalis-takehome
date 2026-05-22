#!/usr/bin/env bash
#
# sync-classroom.sh — push this template's current state into a GitHub Classroom
# assignment's org-level copy as a single "Initial commit".
#
# Why: Classroom snapshots the template only at assignment-creation time.
# Later commits don't propagate. And the org copy is what candidates see — we
# don't want to leak our internal commit history into their forks.
#
# Usage:
#   ./scripts/sync-classroom.sh                                   # uses default org copy
#   ./scripts/sync-classroom.sh certalis/<assignment-org-copy>    # custom org copy
#
# Env overrides:
#   SYNC_COMMIT_AUTHOR_NAME   (default: Certalis)
#   SYNC_COMMIT_AUTHOR_EMAIL  (default: hiring@certalis.com)
#   SYNC_COMMIT_MSG           (default: Initial commit)
#
# After running this, click "Sync assignments" in the Classroom UI to propagate
# the change to any existing student forks. New forks will pick it up on accept.
#
# Destructive: force-pushes to the org copy's main. Never touches this template.

set -euo pipefail

ORG_COPY_REPO="${1:-certalis/dev-takehome-source}"
COMMIT_AUTHOR_NAME="${SYNC_COMMIT_AUTHOR_NAME:-Certalis}"
COMMIT_AUTHOR_EMAIL="${SYNC_COMMIT_AUTHOR_EMAIL:-hiring@certalis.com}"
COMMIT_MSG="${SYNC_COMMIT_MSG:-Initial commit}"

TEMPLATE_ROOT="$(git rev-parse --show-toplevel)"
WORK_DIR="$(mktemp -d -t classroom-sync-XXXXXX)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Template:   $TEMPLATE_ROOT"
echo "Org copy:   $ORG_COPY_REPO"
echo "Author:     $COMMIT_AUTHOR_NAME <$COMMIT_AUTHOR_EMAIL>"
echo

read -r -p "Force-push HEAD as single '$COMMIT_MSG' to $ORG_COPY_REPO? [y/N] " confirm
[[ "$confirm" == "y" || "$confirm" == "Y" ]] || { echo "Aborted."; exit 1; }

git -C "$TEMPLATE_ROOT" archive --format=tar HEAD | tar -x -C "$WORK_DIR"

# Strip files we don't want candidates to see.
rm -rf "$WORK_DIR/scripts"

cd "$WORK_DIR"
git init --quiet -b main
git add -A
git -c user.name="$COMMIT_AUTHOR_NAME" -c user.email="$COMMIT_AUTHOR_EMAIL" \
    commit -m "$COMMIT_MSG" --quiet

git push --force "git@github.com:${ORG_COPY_REPO}.git" main:main

echo
echo "Done. Verify: https://github.com/${ORG_COPY_REPO}/commits/main"
echo "Next: click 'Sync assignments' in Classroom UI to propagate to existing student forks."
