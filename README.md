# vntana-store

VNTANA 3D showcase and tradeshow demo pages. Pure static site (nginx), served from a
Dockerfile. See `RUNBOOK.md` for how the interactive viewer pages and material bakes are built.

## Repos

- **origin**: `github.com/dcicero8/vntana-store` (personal)
- **company** (`company` remote): `github.com/derekcicero-vntana/store-demos` (mirror; `origin` dual-pushes here too)

## Deployment (new Railway)

- Account: `derek.cicero@vntana.com`, workspace **My Projects**
- Project: **vntana-store** `cdfbac26-4393-4fcd-ba74-e8d725c7d412`
- Environment: `production` `22c136ab-037b-4f57-bd9c-2061e0a46f80`
- Service: `web` `6df54d66-0497-469c-8613-63d33182302e`
- URL: **https://vntana-store.up.railway.app**
- Custom domain: **demo.vntana.com** (pending DNS)
  - CNAME `demo` -> `o2iw1m2f.up.railway.app`
  - TXT `_railway-verify.demo` -> `railway-verify=cb60199d5fd4b8ab8bdd91a68f0421e8a18e9b003ae688420e3604aca804a8c2`

Served via `Dockerfile` (nginx:alpine, `nginx.conf`, listens on `$PORT`).

Deploy: `railway up --project cdfbac26-4393-4fcd-ba74-e8d725c7d412 --environment production --service 6df54d66-0497-469c-8613-63d33182302e`
(or connect the `store-demos` repo in the Railway dashboard for auto-deploy on push).

## Legacy deploy (still live)

- **https://vntana-store-production.up.railway.app** on the OLD Railway account. Kept alive so
  existing customer links, QR codes, and shared demo URLs keep working. Retire it once links
  have migrated to the new URL / `demo.vntana.com`.
