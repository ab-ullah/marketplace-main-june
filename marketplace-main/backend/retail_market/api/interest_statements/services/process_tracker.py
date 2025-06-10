import uuid
from api.interest_statements.models import StateChoice, ProcessState

class ProcessTracker:

    def __init__(self, process_name, created_by):
        self.process_id = uuid.uuid4()
        self.process_name = process_name
        self.created_by = created_by
        self.state = None
        self.description = None
        self.process_obj = None

    def move_state(self, state, description=None):
        self.state = state
        self.description = description if description else None

        if state == StateChoice.STARTED:
            self.process_obj = ProcessState.objects.create(
                process_id = self.process_id,
                process_name = self.process_name,
                state = self.state,
                description = self.description,
                created_by = self.created_by
            )
            self.process_obj.save()
        else:
            self.process_obj.state = state
            self.save()

    def start(self):
        self.move_state(StateChoice.STARTED)

    def move_in_progress(self):
        self.move_state(StateChoice.IN_PROGRESS)

    def move_completed(self):
        self.move_state(StateChoice.COMPLETED)

    def move_failed(self, fail_reason):
        self.move_state(StateChoice.FAILED, fail_reason)
