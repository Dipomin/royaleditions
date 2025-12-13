# Deploy Scripts

This folder contains helpful deploy helpers for the Next.js standalone build used on the VPS.

Scripts:

- `deploy-standalone-simple.sh` — Simple build + copy + start using PM2.
- `deploy-standalone-atomic.sh` — Atomic release deploy with symlink switch, health check and rollback.
- `deploy-standalone-stop-start.sh` — Stop, build, copy, start PM2 (recommended if you have lingering processes).
- `check-manifests.sh` — Compare client/server manifest files between an existing release and a candidate release.

Examples:

Run atomic deploy and keep last 3 releases

```bash
PORT=3001 HOSTNAME=0.0.0.0 KEEP_RELEASES=3 ./scripts/deploy-standalone-atomic.sh
# or
PORT=3001 HOSTNAME=0.0.0.0 ./scripts/deploy-standalone-atomic.sh --keep-last=3
```

Health endpoint used by scripts: `/api/health` — added for quick verification of app readiness.

Notes:
- Ensure you have `rsync`, `pm2`, `curl` installed on the server.
- These scripts assume the repo lives at `/root/royal-editions` or is executed from repo root.
- Add automation to CI to build + SCP `.next/standalone` to server when desired.
