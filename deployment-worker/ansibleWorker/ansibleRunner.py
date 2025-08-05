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
            if event.get('event') == 'runner_on_ok' or event.get('event') == 'runner_on_failed':
                event_data = event.get('event_data', {})
                log["task"] = event_data.get('task')
                log["host"] = event_data.get('host')
                log["role"] = event_data.get('role')
                log["res"] = event_data.get('res')
                log["duration"] = event_data.get('duration')
                log['event'] = event.get('event')
            elif event.get('event') == 'playbook_on_stats':
                event_data = event.get('event_data', {})
                log["changed"] = event_data.get('changed')
                log["failures"] = event_data.get('failures')
                log["ignored"] = event_data.get('ignored')
                log["ok"] = event_data.get('ok')
                log["processed"] = event_data.get('processed')
                log["skipped"] = event_data.get('skipped')
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
