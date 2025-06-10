class MissingUploadedByUserException(Exception):
    """For case where document scope is USER_ONLY and there is no uploaded_by_user"""
    pass
