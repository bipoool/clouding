# clouding.OpenPort Ansible Role

This role opens a specified TCP port using iptables and makes the rule persistent across reboots.

## Requirements
- Ansible
- iptables installed on the target host

## Role Variables
- `PORT` (**required**): The TCP port number to open.

## Example Playbook
```yaml
- hosts: all
  become: true
  vars:
    PORT: 8080
  roles:
    - role: clouding.OpenPort
```

## Supported OS
- Debian/Ubuntu (saves rules to `/etc/iptables/rules.v4`)
- RedHat/CentOS (uses `service iptables save`) 