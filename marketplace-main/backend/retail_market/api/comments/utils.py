import re

from api.comments.models import Comment

KYC_PATH_REGEX = re.compile(r'kyc_record/(\d+)/?')
RESPONSE_TEXT_REGEX = re.compile(r'question/(.+)\?target')


def kyc_id_from_comment(comment: Comment):
    path = comment.path
    search = KYC_PATH_REGEX.search(path)
    if search and search.groups():
        return int(search.groups()[0])


def response_block_id_from_comment(comment: Comment):
    section = comment.section
    search = RESPONSE_TEXT_REGEX.search(section)
    if search and search.groups():
        try:
            return int(search.groups()[0])
        except:
            return search.groups()[0]
