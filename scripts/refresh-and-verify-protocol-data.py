#!/usr/bin/env python3
"""
Wrapper script: runs protocol data refresh + attestation verification.
Ensures attestation is always applied after refresh.
"""
import subprocess
import sys

def run_script(script_path, cwd):
    """Run a Python script and return result."""
    result = subprocess.run(
        [sys.executable, script_path],
        cwd=cwd,
        capture_output=True,
        text=True
    )
    return result

def main():
    repo_dir = '/home/user/repos/digital-nation-website'
    
    print("=== Step 1: Refresh protocol data ===")
    result = run_script('scripts/refresh-protocol-data.py', repo_dir)
    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    if result.returncode != 0:
        print(f"Refresh failed with exit code {result.returncode}", file=sys.stderr)
        return result.returncode
    
    print("\n=== Step 2: Verify protocol attestation ===")
    result = run_script('scripts/verify-protocol-attestation.py', repo_dir)
    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    if result.returncode != 0:
        print(f"Verification failed with exit code {result.returncode}", file=sys.stderr)
        return result.returncode
    
    print("\n=== Protocol data refresh + attestation complete ===")
    return 0

if __name__ == '__main__':
    sys.exit(main())