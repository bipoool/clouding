import json
import ansible_runner
import requests
import time
import json

class AnsibleRunner:

    def __init__(self, lokiEndPoint, jobId, playbookName, workDir, isPlan = False):
        self.lokiEndPoint = lokiEndPoint
        self.jobId = jobId
        self.playbookName = playbookName
        self.isPlan = isPlan
        self.workDir = workDir

    def run(self):
        cmdLine = ''
        if self.isPlan:
            cmdLine += '--check --diff'
        ansible_runner.run(
            private_data_dir=self.workDir,
            playbook=self.playbookName,
            cmdline=cmdLine,
            event_handler=self.handleEvent(),
            quiet=True,
        )

    def handleEvent(self):
        def _handleEvent(event):
            log = {}
            if event.get('event') == 'runner_on_ok' or event.get('event') == 'runner_on_failed' or event.get('event') == 'runner_on_unreachable':
                eventData = event.get('event_data', {})
                log["task"] = eventData.get('task')
                log["host"] = eventData.get('host')
                log["role"] = eventData.get('role')
                log["res"] = eventData.get('res')
                log["duration"] = eventData.get('duration')
                log['event'] = event.get('event')
            elif event.get('event') == 'playbook_on_stats':
                eventData = event.get('event_data', {})
                log["changed"] = eventData.get('changed')
                log["failures"] = eventData.get('failures')
                log["ignored"] = eventData.get('ignored')
                log["ok"] = eventData.get('ok')
                log["processed"] = eventData.get('processed')
                log["skipped"] = eventData.get('skipped')
                log['event'] = event.get('event')
            if log != {}:
                print(log)
                self.sendToLoki(log)
        return _handleEvent

    def sendToLoki(self, data):
        timestamp = str(int(time.time() * 1e9))
        payload = {
            "streams": [
                {
                    "stream": {
                        "jobId": self.jobId
                    },
                    "values": [
                        [timestamp, json.dumps(data)]
                    ]
                }
            ]
        }

        try:
            response = requests.post(
                self.lokiEndPoint,
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"},
                timeout=3
            )
            if response.status_code != 204:
                print(f"Error sending log to Loki: {response.status_code}, {response.text}")
        except Exception as e:
            print(f"Exception sending log to Loki: {e}")
