from fastapi import FastAPI, Query, HTTPException
from sse_starlette.sse import EventSourceResponse
import ansible_runner
import os
from ansible_runner.runner import Runner
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5500"] for stricter
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/run")
def run_playbook(playbook: str = Query(..., description="Path to the Ansible playbook")):
    """
    SSE endpoint to run the playbook and stream its progress and logs.
    Accepts a 'playbook' query parameter for the playbook path.
    """
    playbook = "./playbooks/" + playbook
    # Validate playbook path
    if not os.path.isfile(playbook):
        raise HTTPException(status_code=400, detail=f"Playbook not found: {playbook}")

    def event_generator():
        try:
            thread, runner = ansible_runner.run_async(
                private_data_dir=".",
                playbook=playbook,
                quiet=True
            )
        except Exception as e:
            yield {"event": "error", "data": f"Failed to start runner: {str(e)}"}
            return

        while thread.is_alive():
            processed_events = set()
            if isinstance(runner, Runner):
                for e in runner.events:
                    event_uuid = e['uuid']
                    if event_uuid in processed_events:
                        continue
                    processed_events.add(event_uuid)
                    stdout = e.get("stdout")
                    event_type = e.get("event")
                    if stdout:
                        yield {
                            "event": "log",
                            "data": stdout
                        }
                    if event_type:
                        yield {
                            "event": "progress",
                            "data": event_type
                        }
        yield {
            "event": "end",
            "data": "Playbook finished"
        }

    return EventSourceResponse(event_generator())
