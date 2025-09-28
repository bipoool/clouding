#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COLLECTION_REQ="${ROOT_DIR}/ansibleWorker/collections/requirements.yml"
ROLE_REQ="${ROOT_DIR}/ansibleWorker/roles/requirements.yml"

if [[ -f "${COLLECTION_REQ}" ]]; then
  echo "Installing Ansible collections from ${COLLECTION_REQ}" >&2
  ansible-galaxy collection install -r "${COLLECTION_REQ}" --force
else
  echo "No collection requirements found at ${COLLECTION_REQ}" >&2
fi

if [[ -f "${ROLE_REQ}" ]]; then
  echo "Installing Ansible roles from ${ROLE_REQ}" >&2
  ansible-galaxy role install -r "${ROLE_REQ}" --force
else
  echo "No role requirements found at ${ROLE_REQ}" >&2
fi
