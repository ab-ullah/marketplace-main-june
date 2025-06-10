from api.eligibility_criteria.blocks_data.block_ids import APPROVAL_CHECKBOX_ID, NO_LOCAL_REQUIREMENT_BLOCK_ID

ANY_REGION_BLOCKS = [
    {
        'heading': 'Approval Checkboxes',
        'block_id': APPROVAL_CHECKBOX_ID,
        'title': 'Please review the following document(s)',
        'description': 'Lorem ipsum dolor sit amet, consectetur',
        'has_checkboxes': True,
        'admin_uploaded_files': True,
        'allow_multiple_files': True
    },
    {
        'heading': 'No Local Requirement',
        'block_id': NO_LOCAL_REQUIREMENT_BLOCK_ID,
        'title': 'No Local Requirement',
        'is_admin_only': True,
        'options': {
            'entity': [],
            'individual': [

            ]
        }
    }
]
