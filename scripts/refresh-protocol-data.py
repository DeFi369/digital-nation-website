#!/usr/bin/env python3
"""Refresh digital-nation-website protocol data from AEP/dynAEP/GAP/conformance/signatures artifacts."""
from pathlib import Path
import re, json, datetime, subprocess, sys

REPO_ROOT = Path('/home/user/repos')
SITE_ROOT = REPO_ROOT / 'digital-nation-website'
OUT = SITE_ROOT / 'assets' / 'data' / 'protocol-data.json'
HERMES_DIR = Path('/home/user/.hermes')

def read_text(path, n=None):
    p = Path(path)
    if not p.exists():
        return ''
    text = p.read_text(errors='ignore')
    return text[:n] if n else text

def first(pattern, text, flags=re.I):
    m = re.search(pattern, text, flags)
    return m.group(1).strip() if m else None

def count_files(pattern):
    return len(list(REPO_ROOT.glob(pattern)))

def shell(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.STDOUT).strip()
    except Exception as e:
        return ''

def _extract_first_json_object(text: str) -> dict | None:
    start = text.find('{')
    if start == -1:
        return None
    end = text.rfind('}')
    if end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None

aep_text = read_text(REPO_ROOT / 'AEP' / 'README.md', 3000)
dynaep_text = read_text(REPO_ROOT / 'dynAEP' / 'README.md', 3000)
gap_text = read_text(REPO_ROOT / 'GAP' / 'README.md', 3000)
conformance_text = read_text(REPO_ROOT / 'aep-conformance' / 'README.md', 3000)
signatures_text = read_text(REPO_ROOT / 'aep-signatures' / 'README.md', 3000)

html_files = sorted(SITE_ROOT.glob('*.html'))
page_count = len(html_files)
latest_commit = shell('cd /home/user/repos/digital-nation-website && git log -1 --format="%H %s"')
latest_commit_date = shell('cd /home/user/repos/digital-nation-website && git log -1 --format="%ci"').split(' ')[0]

cross_repo_pages = sorted({p.name for p in html_files if p.name in {
    'protocol-status.html', 'ecosystem-status.html', 'memory-lattice.html', 'research.html', 'sovereign-security.html'
}})

identity_manifests = sorted(HERMES_DIR.glob('profiles/*/identity-manifest.json'))
identity_key_dirs = sorted(HERMES_DIR.glob('identity-keys/*'))

def build_stack(meta):
    tid = meta['id']
    texts = {
        'aep': aep_text,
        'dynaep': dynaep_text,
        'gap': gap_text,
        'conformance': conformance_text,
        'signatures': signatures_text,
    }
    text = texts.get(tid, '')
    version = None
    for pat in meta['version_patterns']:
        version = first(pat, text)
        if version:
            break
    status = meta.get('status_default', 'active')
    if tid in {'conformance', 'signatures'}:
        if 'scaffolding' in text.lower() or 'pre-v1.0' in text.lower() or 'format-finalization' in text.lower():
            status = 'pre-v1.0'
    summary = meta.get('summary') or first(r'^(.{0,220})', text.replace('\n', ' ')) or ''
    summary = re.sub(r'\s+', ' ', summary).strip()
    if len(summary) > 220:
        summary = summary[:217].rstrip() + '...'
    artifacts = []
    if tid == 'conformance':
        artifacts = [p.name for p in (REPO_ROOT / 'aep-conformance').rglob('*') if p.is_file() and 'node_modules' not in str(p)][:20]
    if tid == 'signatures':
        artifacts = [p.name for p in (REPO_ROOT / 'aep-signatures').rglob('*') if p.is_file() and 'node_modules' not in str(p)][:20]
    components = meta.get('components', [])
    if tid == 'aep':
        components = [c.strip() for c in first(r'Components\s*\n(.{0,500})', text, flags=re.I + re.S) or '' .split('\n') if c.strip()][:8] or components
    if tid == 'dynaep':
        components = [c.strip() for c in (first(r'Temporal Authority.*?Perception Governance', text, flags=re.S) or '').split('\n') if c.strip()][:8] or components
    if tid == 'gap':
        components = ['Meta-Schema', 'Constrained decoding', 'Structural validation', 'Governance lattice', 'Subprotocol validators']
    return {
        'id': tid,
        'name': meta['name'],
        'fullName': meta['fullName'],
        'version': version or 'unknown',
        'status': status,
        'source': f"repos/{tid}/README.md",
        'summary': summary,
        'components': components,
        'artifacts': artifacts,
    }

stacks = [
    build_stack({
        'id': 'aep',
        'name': 'AEP',
        'fullName': 'Agent Element Protocol',
        'version_patterns': [r'Version\s+([0-9.]+)', r'v([0-9.]+)'],
        'status_default': 'active',
        'components': ['Base Node', 'Lattice Channels', 'AgentMesh & Identity', 'POTOMITAN mesh fallback', 'Policy & GAP', 'CAW Framework', 'Conformance & SDKs'],
        'highlights': ['PQEncryptedCapsule sealed frames on lattice transport', 'One hyperlattice per governed system', 'Public CC-01..CC-15 conformance battery', 'Composer Lite on :8424'],
    }),
    build_stack({
        'id': 'dynaep',
        'name': 'dynAEP',
        'fullName': 'Dynamic Agent Element Protocol',
        'version_patterns': [r'Version\s+([0-9.]+)', r'v([0-9.]+)'],
        'status_default': 'active',
        'components': ['Action Lattice', 'Temporal Authority (dynAEP-TA)', 'Perception Governance (dynAEP-TA-P)', 'Observer Adapters & MCP', 'GAP translator'],
        'highlights': ['Native MCP server with 7 tools', 'Partial-order event validation at arrival time', 'GAP-to-dynAEP translation', 'Auto-discovery bootstrap'],
    }),
    build_stack({
        'id': 'gap',
        'name': 'GAP',
        'fullName': 'Governed Agentic Programming',
        'version_patterns': [r'version:\s*"?([0-9.]+)"?', r'Version\s+([0-9.]+)'],
        'status_default': 'active',
        'components': ['Meta-Schema', 'Constrained decoding', 'Structural validation', 'Governance lattice', 'Subprotocol validators'],
        'highlights': ['Three-layer enforcement', 'Self-governing by construction', 'YAML-native instruction format', 'Provenance and proof chain tracking'],
    }),
    build_stack({
        'id': 'conformance',
        'name': 'aep-conformance',
        'fullName': 'AEP Conformance Suite',
        'version_patterns': [r'Version\s+([0-9.]+)', r'v([0-9.]+)'],
        'status_default': 'scaffolding',
        'components': ['Test harness', 'Schema checks'],
        'highlights': ['Local runner artifacts', 'Readme-driven status'],
    }),
    build_stack({
        'id': 'signatures',
        'name': 'aep-signatures',
        'fullName': 'AEP Signature Trust Bundle',
        'version_patterns': [r'Version\s+([0-9.]+)', r'v([0-9.]+)'],
        'status_default': 'scaffolding',
        'components': ['Trust bundle', 'Manifest verifier'],
        'highlights': ['Local RSA demo path', 'Profile identity PoC outside repo'],
    }),
]

metrics = {
    'aepVersion': next((s['version'] for s in stacks if s['id'] == 'aep'), 'unknown'),
    'dynaepVersion': next((s['version'] for s in stacks if s['id'] == 'dynaep'), 'unknown'),
    'gapStatus': next((s['version'] for s in stacks if s['id'] == 'gap'), 'unknown'),
    'conformanceStatus': next((s['status'] for s in stacks if s['id'] == 'conformance'), 'scaffolding'),
    'signatureStatus': next((s['status'] for s in stacks if s['id'] == 'signatures'), 'scaffolding'),
    'totalComponents': sum(len(s['components']) for s in stacks),
    'artifactFileCount': sum(len(s.get('artifacts', [])) for s in stacks),
    'pageCount': page_count,
    'crossRepoPageCount': len(cross_repo_pages),
    'crossRepoPages': cross_repo_pages,
    'identityManifestCount': len(identity_manifests),
    'identityKeyCount': len(identity_key_dirs),
    'latestCommit': latest_commit,
    'latestCommitDate': latest_commit_date,
    'lastAudit': datetime.date.today().isoformat(),
}

# Optional quantum compute signal from hyper-lattice repo
quantum_harness = Path("/home/user/.hermes/scripts/quantum-lattice-harness.py")
quantum_status = None
if quantum_harness.exists():
    try:
        raw = subprocess.check_output([sys.executable, str(quantum_harness)], text=True, stderr=subprocess.STDOUT)
    except Exception:
        raw = ''
    if raw.strip():
        block = _extract_first_json_object(raw)
        if isinstance(block, dict) and 'result' in block:
            quantum_status = {
                'available': True,
                'collapseChosenLattice': block['result'].get('collapse_chosen_lattice'),
                'afterNormalizeTotal': block['result'].get('after_normalize_total'),
                'boosterPhaseReady': block['result'].get('boosted_lattice_memory_amplitude') is not None,
            }
        else:
            quantum_status = None
    else:
        quantum_status = None

out = {
    'generated': datetime.date.today().isoformat(),
    'generator': 'protocol-data-generator',
    'ministry': 'Secretary of Technology & Innovation',
    'stacks': stacks,
    'metrics': metrics,
    'quantum': quantum_status,
    'citizenBenefits': [
        'Deterministic transparency for public services',
        'Auditable automation via evidence ledgers',
        'Sovereign resilience without vendor lock-in',
        'Temporal governance for trustworthy timestamps',
        'Local identity verification for agent accountability'
    ]
}

OUT.write_text(json.dumps(out, indent=2) + '\n')
print(f'Wrote {OUT}')
print(json.dumps(metrics, indent=2))
