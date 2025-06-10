from dataclasses import dataclass


@dataclass
class ApplicationModuleState:
    module: str
    is_valid_state: bool
    message: str

    def get_state(self):
        return {
            'module': self.module,
            'is_valid_state': self.is_valid_state,
            'message': self.message
        }
