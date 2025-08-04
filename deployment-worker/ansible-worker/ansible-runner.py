from fastapi import FastAPI, Query, HTTPException
from sse_starlette.sse import EventSourceResponse
import ansible_runner
import os
from ansible_runner.runner import Runner
from fastapi.middleware.cors import CORSMiddleware

def ansibleRunner(playbookPath: str):
    try:
        thread, runner = ansible_runner.run_async(
            private_data_dir=".",
            playbook=playbookPath,
            cmdline='--check --diff',
            quiet=True
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to start runner: {str(e)}")

    while thread.is_alive():
        processed_events = set()
        if isinstance(runner, Runner):
            for e in runner.events:
                event_uuid = e['uuid']
                if event_uuid in processed_events:
                    continue
                processed_events.add(event_uuid)
                # stdout = e.get("stdout")
                # event_type = e.get("event")

                if e.get('event') == 'runner_on_ok':
                    event_data = e.get('event_data', {})
                    task = event_data.get('task')
                    changed = event_data.get('res', {}).get('changed', False)
                    if changed:
                        print(f"Changed  - {task}")
                    else:
                        print(f"Ok  - {task}")

                # if stdout:
                #     print("event log: ", stdout)
                #     # yield {
                #     #     "event": "log",
                #     #     "data": stdout
                #     # }
                # if event_type:
                #     print("event progress: ", event_type)
                    # yield {
                    #     "event": "progress",
                    #     "data": event_type
                    # }
    # yield {
    #     "event": "end",
    #     "data": "Playbook finished"
    # }
    print("event end: ", "Playbook finished")
