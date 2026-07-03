#!/usr/bin/env python3
"""Refresh digital-nation-website protocol data from AEP/dynAEP/GAP READMEs."""
from pathlib import Path
import re, json, datetime

REPO_ROOT = Path('/home/user/repos')
SITE_ROOT = REPO_ROOT / 'digital-nation-website'
OUT = SITE_ROOT / 'assets' / 'data' / 'protocol-data.json'

def read_head(path, n=80):
    p = Path(path)
    return p.read_text(errors='ignore') if p.exists() else ''

aep = read_head(REPO_ROOT / 'AEP' / 'README.md')
dynaep = read_head(REPO_ROOT / 'dynAEP' / 'README.md')
gap = read_head(REPO_ROOT / 'GAP' / 'README.md')

version = lambda text, pat: (re.search(pat, text) or [None, 'unknown'])[1] or 'unknown'

stacks = [
  {
    'id': 'aep',
    'name': 'AEP',
    'fullName': 'Agent Element Protocol',
    'version': version(aep, r'Version\s+([0-9.]+)'),
    'status': 'active',
    'source': 'repos/AEP/README.md',
    'summary': 'Build-time structural governance for deterministic scenes, action_path registries, and policy-enabled agent wrappers.',
    'components': ['Base Node', 'Lattice Channels', 'AgentMesh & Identity', 'POTOMITAN mesh fallback', 'Policy & GAP', 'CAW Framework', 'Conformance & SDKs'],
    'highlights': ['PQEncryptedCapsule sealed frames on lattice transport', 'One hyperlattice per governed system', 'Public CC-01..CC-15 conformance battery', 'Composer Lite on :8424']
  },
  {
    'id': 'dynaep',
    'name': 'dynAEP',
    'fullName': 'Dynamic Agent Element Protocol',
    'version': version(dynaep, r'Version\s+([0-9.]+)'),
    'status': 'active',
    'source': 'repos/dynAEP/README.md',
    'summary': 'Runtime event governance for multi-agent systems via a deterministic Action Lattice, temporal authority, and perception governance.',
    'components': ['Action Lattice', 'Temporal Authority (dynAEP-TA)', 'Perception Governance (dynAEP-TA-P)', 'Observer Adapters & MCP', 'GAP translator'],
    'highlights': ['Native MCP server with 7 tools', 'Partial-order event validation at arrival time', 'GAP-to-dynAEP translation', 'Auto-discovery bootstrap']
  },
  {
    'id': 'gap',
    'name': 'GAP',
    'fullName': 'Governed Agentic Programming',
    'version': 'pre-v1.0',
    'status': 'active',
    'source': 'repos/GAP/README.md',
    'summary': 'Structural instruction language for governed agency with constrained decoding, structural validation, and governance lattice enforcement.',
    'components': ['Meta-Schema', 'Constrained decoding', 'Structural validation', 'Governance lattice', 'Subprotocol validators'],
    'highlights': ['Three-layer enforcement', 'Self-governing by construction', 'YAML-native instruction format', 'Provenance and proof chain tracking']
  }
]

out = {
  'generated': datetime.date.today().isoformat(),
  'generator': 'protocol-data-generator',
  'ministry': 'Secretary of Technology & Innovation',
  'stacks': stacks,
  'metrics': {
    'aepVersion': stacks[0]['version'],
    'dynaepVersion': stacks[1]['version'],
    'gapStatus': stacks[2]['version'],
    'conformanceStatus': 'pre-v1.0',
    'signatureStatus': 'pre-v1.0',
    'totalComponents': sum(len(s['components']) for s in stacks),
    'lastAudit': datetime.date.today().isoformat()
  },
  'citizenBenefits': [
    'Deterministic transparency for public services',
    'Auditable automation via evidence ledgers',
    'Sovereign resilience without vendor lock-in',
    'Temporal governance for trustworthy timestamps'
  ]
}
OUT.write_text(json.dumps(out, indent=2) + '\n')
print(f'Wrote {OUT}')
print(json.dumps(out['metrics'], indent=2))
