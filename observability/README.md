# Observability stack (Phase 0)

Infrastructure-only monitoring for the analyzer. **No microservice code is
changed** — only a compose overlay plus config-only Kong plugins. This is the
plumbing that later phases read to fill in `systems/*.measured.toml`.

## What's in it

| Component | Role | Port |
|-----------|------|------|
| **Prometheus** | metrics store (scrapes the below) | 9090 |
| **Grafana** | dashboards (Prometheus datasource pre-provisioned) | 3000 |
| **OTel Collector** | fan-out: metrics → Prometheus, traces → **Honeycomb** | 4317/4318/8889 |
| **cAdvisor** | per-container CPU/mem for every service (language-agnostic) | 8080 |
| **Beyla (eBPF)** | per-service request rate/latency + traces, zero code | — |
| **Kong plugins** | `prometheus` (per-route metrics) + `opentelemetry` (traces) | 8001 |

Two telemetry halves: **metrics** (Prometheus/Grafana) feed the models;
**traces** (Honeycomb) give per-request, cross-service visibility.

## Setup

1. Get a Honeycomb API key (free tier): <https://ui.honeycomb.io/> → Environment
   settings → API Keys.
2. Create the env file (git-ignored, key stays local):
   ```bash
   cp observability/.env.example observability/.env
   # edit observability/.env and paste your HONEYCOMB_API_KEY
   ```

## Bring it up (from the repo root)

```bash
docker compose -f docker-compose.yaml \
               -f observability/docker-compose.observability.yaml up -d
```

## Verify

- **Prometheus targets** → <http://localhost:9090/targets> — `cadvisor`, `kong`,
  `otel-collector` should be **UP**.
- **Grafana** → <http://localhost:3000> (anonymous access on; admin/admin) →
  dashboard *"Analyzer - System Overview"*.
- **cAdvisor** → <http://localhost:8080>.
- **Honeycomb traces** → generate traffic, then look in the Honeycomb UI:
  ```bash
  # drive some requests through the gateway
  k6 run PerformanceAnalysis/script.js       # or just click around the app
  ```
  You should see traces for `kong-gateway` and the backend services.

## Notes & caveats (read before debugging)

- **Beyla** needs `privileged` + host PID and a recent kernel with eBPF (your
  Fedora/Nobara kernel is fine). If it can't attach, check container logs; the
  `BEYLA_OPEN_PORT` range (8000–8090) selects which listeners to instrument.
- **Kong metric names** (`kong_http_requests_total`, etc.) vary slightly by Kong
  version; the Grafana Kong panel may need the query adjusted for your version.
- The **`opentelemetry`** Kong plugin requires Kong 3.x (the compose uses
  `kong:latest`).
- Images are pinned to `:latest` for convenience — pin to specific versions for
  a reproducible thesis artifact.
- Everything here is **additive**: `docker compose ... down` removes the
  observability containers and leaves the app untouched.

## What feeds off this

- **Phase 1 (collection)** queries Prometheus (Kong + cAdvisor + Beyla) to
  measure arrival rate λ, service rate μ, and utilization, and writes them to
  `systems/<name>.measured.toml`.
- **Phase 2 (failure injection)** uses the same stack to observe recovery times.
