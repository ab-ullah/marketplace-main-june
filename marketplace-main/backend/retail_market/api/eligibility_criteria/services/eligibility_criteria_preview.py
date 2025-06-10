class CriteriaPreviewService:
    def __init__(self, data):
        self.data = data

    def set_answer(self):
        for criteria_block in self.data['criteria_blocks']:
            criteria_block['selectedAnswer'] = False

    def add_intro_block(self):
        self.data['criteria_blocks'].append({
            'position': 0,
            'is_intro_step': True,
            'is_final_step': False,
            'is_user_documents_step': False,
        })

    def set_final_block_position(self, add_intro):
        intro_block_factor = 1 if add_intro else 0
        for criteria_block in self.data['criteria_blocks']:
            if criteria_block['is_final_step']:
                criteria_block['position'] = len(self.data['criteria_blocks']) - intro_block_factor
            if criteria_block['is_user_documents_step']:
                criteria_block['position'] = len(self.data['criteria_blocks']) - 1 - intro_block_factor

    def process(self, add_intro=True):
        self.set_answer()
        if add_intro:
            self.add_intro_block()
        self.set_final_block_position(add_intro)
        return self.data
