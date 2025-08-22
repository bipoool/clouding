import ansible_runner
import requests
import time
import json
import logging

from models.deployment import DeploymentHostStatus
from models.playbook import PlaybookInfo
from repositories import deployment
from repositories import deploymentHostMapping
from models import deployment as deploymentModels

logger = logging.getLogger(__name__)

class AnsibleRunner:

    def __init__(self, lokiEndPoint, payload: deploymentModels.DeploymentRabbitMqPayload, playbookInfo: PlaybookInfo):
        self.lokiEndPoint = lokiEndPoint
        self.jobId = playbookInfo.jobId
        self.playbookName = playbookInfo.playbookName
        self.workDir = playbookInfo.playbookDir
        self.isPlan = payload.dtype == 'plan'
        self.failedHosts = set()
        self.successHosts = set()

    def run(self):
        cmdLine = ''
        if self.isPlan:
            cmdLine += '--check --diff'
        
        changed = deployment.updateDeploymentStatusToStarted(self.jobId)

        if not changed:
            logger.info(f"Skipping run for{self.jobId} as status was not pending or ID does not exists")
            return

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
                
                hostId = int(log["host"], base=10)
                if event.get('event') == 'runner_on_failed' or event.get('event') == 'runner_on_unreachable':
                    self.failedHosts.add(hostId)
                else:
                    self.successHosts.add(hostId)

            elif event.get('event') == 'playbook_on_stats':
                eventData = event.get('event_data', {})
                log["changed"] = eventData.get('changed')
                log["failures"] = eventData.get('failures')
                log["ignored"] = eventData.get('ignored')
                log["ok"] = eventData.get('ok')
                log["processed"] = eventData.get('processed')
                log["skipped"] = eventData.get('skipped')
                log['event'] = event.get('event')

                deploymentHostMapping.updateDeploymentHostStatus(self.jobId, list(self.successHosts), DeploymentHostStatus.COMPLETED)
                deploymentHostMapping.updateDeploymentHostStatus(self.jobId, list(self.failedHosts), DeploymentHostStatus.FAILED)

                # Changing status for the job
                if len(self.failedHosts) > 0:
                    deployment.updateDeploymentStatusToFailed(self.jobId)
                else:
                    deployment.updateDeploymentStatusToCompleted(self.jobId)

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
                self.lokiEndPoint + "/loki/api/v1/push",
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"},
                timeout=3
            )
            if response.status_code != 204:
                print(f"Error sending log to Loki: {response.status_code}, {response.text}")
        except Exception as e:
            print(f"Exception sending log to Loki: {e}")
