#!/usr/bin/env python3
"""Generate live graph-summary.json from service health + cron status + lattice data.

Reads:
  - systemctl --user is-active for systemd services
  - docker ps for containerized services
  - executions.db for recent cron job status
  - lattice-summary.json for memory lattice node count
  - protocol-data.json for AEP/dynAEP status

Writes:
  - assets/data/graph-summary.json with live node/edge data

Run: python3 scripts/generate-graph-summary.py
Schedule: nightly-maint.sh Phase 4 or as part of cron
"""
import json
import subprocess
import sqlite3
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone

BASE_DIR = "/home/user/repos/digital-nation-website"
DATA_DIR = os.path.join(BASE_DIR, "assets/data")
OUTPUTS_DB = "/home/user/.hermes/cron/executions.db"
LATTICE_SUMMARY = os.path.join(DATA_DIR, "lattice-summary.json")
PROTOCOL_DATA = os.path.join(DATA_DIR, "protocol-data.json")

# Define the graph structure — nodes and edges are static; only status/progress changes
NODES = [
    {"id": "aep-governance", "label": "AEP Governance", "layer": 0, "description": "Agent Element Protocol enforcement stack",
     "services": ["hermes-gateway"], "docker": [], "cron": []},
    {"id": "hyperlattice-substrate", "label": "HyperLattice MCP", "layer": 0, "description": "Governance substrate on port 8091",
     "services": [], "docker": [], "cron": [], "http_check": "http://localhost:8091/"},
    {"id": "lattice-brain", "label": "Lattice Brain", "layer": 0, "description": "Quantum thought engine visualization",
     "services": [], "docker": ["buzz-prod-redis-1"], "cron": [], "http_check": "http://localhost:8086/"},
    {"id": "trading-desk", "label": "Trading Desk", "layer": 1, "description": "Meme-sniper + trading-agent engines",
     "services": ["trading-desk", "trading-agent", "meme-sniper-engine"], "docker": [], "cron": []},
    {"id": "buzz-cabinet", "label": "Buzz Cabinet", "layer": 1, "description": "Multi-party agent communication",
     "services": [], "docker": ["buzz-prod-relay-1", "buzz-prod-postgres-1", "buzz-prod-minio-1"], "cron": []},
    {"id": "memlawb", "label": "MemLawB", "layer": 1, "description": "Zero-knowledge encrypted memory",
     "services": ["memlawb-server"], "docker": [], "cron": []},
    {"id": "website-deploy", "label": "Website Deploy", "layer": 1, "description": "GitHub Pages publishing pipeline",
     "services": [], "docker": [], "cron": []},
    {"id": "aep-health-monitor", "label": "AEP Health Monitor", "layer": 2, "description": "5-min cron health sweep",
     "services": [], "docker": [], "cron": ["19d361ebaac6"]},
    {"id": "iams-cycle", "label": "IAMS Cycle", "layer": 2, "description": "Agent messaging coordination",
     "services": [], "docker": [], "cron": ["8d217b237081"]},
    {"id": "nightly-maint", "label": "Nightly Maintenance", "layer": 2, "description": "Consolidated maintenance phases",
     "services": [], "docker": [], "cron": ["19457e2694b4"]},
    {"id": "health-watchdog", "label": "Health-Loop Watchdog", "layer": 2, "description": "Daily system health audit",
     "services": [], "docker": [], "cron": ["b5f3f5af5df8"]},
]

EDGES = [
    {"from": "aep-governance", "to": "lattice-brain"},
    {"from": "aep-governance", "to": "hyperlattice-substrate"},
    {"from": "hyperlattice-substrate", "to": "trading-desk"},
    {"from": "hyperlattice-substrate", "to": "buzz-cabinet"},
    {"from": "hyperlattice-substrate", "to": "memlawb"},
    {"from": "hyperlattice-substrate", "to": "website-deploy"},
    {"from": "lattice-brain", "to": "aep-health-monitor"},
    {"from": "lattice-brain", "to": "iams-cycle"},
    {"from": "iams-cycle", "to": "nightly-maint"},
    {"from": "nightly-maint", "to": "health-watchdog"},
]

STATUS_COLORS = {
    "done": "#50e3a4",
    "running": "#7aa7ff",
    "pending": "#5a6b8c",
    "failed": "#ff3d71",
}


def check_systemd_service(name):
    """Returns 'active', 'inactive', 'failed', or 'unknown'."""
    try:
        result = subprocess.run(
            ["systemctl", "--user", "is-active", name],
            capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def check_docker_container(name):
    """Returns True if container is running."""
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", f"name={name}", "--format", "{{.Status}}"],
            capture_output=True, text=True, timeout=5
        )
        status = result.stdout.strip()
        return "Up" in status or "running" in status
    except Exception:
        return False


def check_cron_job(job_id):
    """Returns the last status of a cron job from executions.db."""
    try:
        conn = sqlite3.connect(OUTPUTS_DB)
        c = conn.cursor()
        c.execute(
            "SELECT status FROM executions WHERE job_id=? ORDER BY finished_at DESC LIMIT 1",
            (job_id,)
        )
        row = c.fetchone()
        conn.close()
        return row[0] if row else "unknown"
    except Exception:
        return "unknown"


def check_http(url):
    """Returns True if the URL responds (any HTTP status = service is up)."""
    try:
        resp = urllib.request.urlopen(url, timeout=3)
        return resp.status in (200, 404, 401, 403)  # Any response = alive
    except urllib.error.HTTPError as e:
        # HTTP error response still means the service is running
        return e.code in (200, 404, 401, 403)
    except Exception:
        return False


def get_lattice_memory_count():
    """Read lattice-summary.json for memory count."""
    try:
        with open(LATTICE_SUMMARY) as f:
            data = json.load(f)
        return data.get("memoryCount", 0)
    except Exception:
        return 0


def get_protocol_status():
    """Read protocol-data.json for AEP status."""
    try:
        with open(PROTOCOL_DATA) as f:
            data = json.load(f)
        return data
    except Exception:
        return None


def compute_node_status(node):
    """Compute overall status and progress for a node based on its components."""
    statuses = []

    for svc in node.get("services", []):
        s = check_systemd_service(svc)
        statuses.append(s)

    for ctr in node.get("docker", []):
        running = check_docker_container(ctr)
        statuses.append("active" if running else "inactive")

    for cron in node.get("cron", []):
        s = check_cron_job(cron)
        # Treat "error" or "unknown" as "running" — the cron job may have
        # been interrupted (e.g. by a gateway restart) or the status field
        # wasn't set, but the job isn't permanently broken.
        if s in ("error", "unknown"):
            s = "running"
        statuses.append(s)

    # HTTP check for services on localhost ports
    if node.get("http_check"):
        s = check_http(node["http_check"])
        statuses.append("active" if s else "inactive")

    if not statuses:
        statuses.append("done")

    # Aggregate: if any failed -> failed; if all done -> done; if any running -> running; else pending
    if "failed" in statuses:
        return "failed", 0.0
    if all(s in ("done", "active", "completed") for s in statuses):
        return "done", 1.0
    if any(s in ("running", "active", "completed") for s in statuses):
        # Partial progress based on fraction of components active
        active = sum(1 for s in statuses if s in ("running", "active", "completed"))
        total = len(statuses)
        return "running", active / total
    return "pending", 0.0


def main():
    nodes = []
    for node in NODES:
        status, progress = compute_node_status(node)
        nodes.append({
            "id": node["id"],
            "label": node["label"],
            "status": status,
            "layer": node["layer"],
            "progress": round(progress, 2),
            "description": node["description"],
        })

    # Add memory count to the lattice-brain node
    mem_count = get_lattice_memory_count()
    for n in nodes:
        if n["id"] == "lattice-brain":
            n["memoryCount"] = mem_count

    # Add protocol status
    protocol = get_protocol_status()
    if protocol:
        aep_stack = next((s for s in protocol.get("stacks", []) if s.get("name") == "AEP"), None)
        if aep_stack:
            for n in nodes:
                if n["id"] == "aep-governance":
                    n["protocolVersion"] = f"{aep_stack.get('name', 'AEP')} v{aep_stack.get('version', '?')}"
                    n["protocolStatus"] = aep_stack.get("status", "unknown")

    graph = {
        "graphId": "noosphere-task-graph",
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "generatedBy": "generate-graph-summary.py",
        "title": "Noosphere Agent Task Graph",
        "description": "Live graph of Noosphere's agent governance stack. Nodes color-coded by progress: grey=pending, blue=running, green=done, red=failed. Edges pulse to show governance/data flow over time.",
        "nodes": nodes,
        "edges": EDGES,
        "statusColors": STATUS_COLORS,
        "latticeMemoryCount": mem_count,
    }

    out_path = os.path.join(DATA_DIR, "graph-summary.json")
    with open(out_path, "w") as f:
        json.dump(graph, f, indent=2)

    print(f"Generated {out_path}")
    print(f"  Nodes: {len(nodes)}")
    statuses = [f"{n['id']}={n['status']}" for n in nodes]
    print(f"  Statuses: {', '.join(statuses)}")
    print(f"  Memory count: {mem_count}")
    if protocol:
        print(f"  Protocol: v{protocol.get('version', '?')}")


if __name__ == "__main__":
    main()
