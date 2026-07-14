"""Optional k6 load generation for Phase-1 measurement.

Arrival rate (lambda) and utilization (rho) only exist while traffic flows, so
they must be measured under load. If the spec has a ``[load]`` section pointing
at the user's **own** k6 script, this module runs it in the official
``grafana/k6`` Docker image -- no host install needed -- and reports how long it
ran, so the collector can measure over a matching window.

The k6 script is always the user's to provide: endpoints, payloads and auth are
application-specific, so a generic analyzer cannot ship a universal one.

Any overrides from the spec are expressed as k6 ``--stage`` flags (never
``--duration``), which lets them cleanly override a script that hard-codes its
own ``options.stages`` without k6's "duration and stages both set" conflict.
"""

from __future__ import annotations

import os
import subprocess
import time
from dataclasses import dataclass, field

_K6_IMAGE = "grafana/k6:latest"


@dataclass
class LoadRun:
    returncode: int
    seconds: float
    command: list
    output: str = ""

    @property
    def ok(self) -> bool:
        return self.returncode == 0


def load_config(spec: dict) -> dict | None:
    """Return the spec's ``[load]`` config, or ``None`` if absent.

    Raises ``ValueError`` if the section exists but omits the required
    ``script`` (there is nothing to run without it).
    """
    cfg = spec.get("load")
    if not cfg:
        return None
    if not cfg.get("script"):
        raise ValueError(
            "[load] section is present but has no 'script' -- point it at your "
            "own k6 load script, or remove [load] to drive traffic manually.")
    return cfg


def sweep_levels(cfg: dict | None) -> list | None:
    """The VU levels to sweep when ``[load].vus`` is a LIST, else ``None``.

    ``vus = [50, 100, 200, 500]`` asks the pipeline to run the load once per
    level and compare them. A scalar ``vus`` (or none) is a single run, so this
    returns ``None`` and the normal single-level flow applies.
    """
    if not cfg:
        return None
    vus = cfg.get("vus")
    if isinstance(vus, list) and vus:
        return [int(v) for v in vus]
    return None


def _stage_flags(cfg: dict) -> list:
    """Translate optional overrides into k6 ``--stage`` flags.

    * explicit ``stages``    -> used as-is
    * ``vus`` (+ ``duration``) -> jump to vus, hold for duration (constant load)
    * neither                -> no flags (the script's own options run)
    """
    stages = cfg.get("stages")
    if stages:
        flags = []
        for stage in stages:
            flags += ["--stage", f'{stage["duration"]}:{stage["target"]}']
        return flags
    vus = cfg.get("vus")
    if isinstance(vus, list):
        return []          # a sweep drives each level explicitly (sweep_levels)
    if vus:
        vus = int(vus)
        duration = cfg.get("duration", "5m")
        return ["--stage", f"0s:{vus}", "--stage", f"{duration}:{vus}"]
    return []


def build_command(cfg: dict, project_dir: str,
                  image: str = _K6_IMAGE) -> list:
    """Build the ``docker run ... k6 run`` command for the load script.

    ``--network host`` lets the script reach the app at ``localhost:<port>``
    (Linux). On macOS/Windows set ``docker_network`` in ``[load]`` and target
    the compose network / ``host.docker.internal`` in your script instead.
    """
    network = cfg.get("docker_network", "host")
    return [
        "docker", "run", "--rm",
        "--network", network,
        "-v", f"{os.path.abspath(project_dir)}:/work",
        "-w", "/work",
        image, "run",
        *_stage_flags(cfg),
        cfg["script"],
    ]


def run_load(cfg: dict, project_dir: str = ".", image: str = _K6_IMAGE,
             timeout: float = 1800.0) -> LoadRun:
    """Run the k6 load script to completion; return timing + exit status."""
    command = build_command(cfg, project_dir, image)
    start = time.time()
    proc = subprocess.run(command, capture_output=True, text=True,
                          timeout=timeout)
    return LoadRun(proc.returncode, time.time() - start, command,
                   (proc.stdout or "") + (proc.stderr or ""))
