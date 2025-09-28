FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build tooling and runtime deps needed for Ansible runner and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    openssh-client \
    rsync \
    sshpass \
    libffi-dev \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Pre-fetch Ansible roles and collections
COPY ansibleWorker/collections/requirements.yml ansibleWorker/collections/requirements.yml
COPY ansibleWorker/roles/requirements.yml ansibleWorker/roles/requirements.yml
COPY scripts/bootstrap_ansible_deps.sh scripts/bootstrap_ansible_deps.sh
RUN chmod +x scripts/bootstrap_ansible_deps.sh && ./scripts/bootstrap_ansible_deps.sh

COPY . .

CMD ["python", "main.py"]
