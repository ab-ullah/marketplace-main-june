import re

MENTION_REGEX = re.compile(r'@\[userID:(\d+)]')

COMMENT_COMPONENT_SEPARATOR = '|'
COMMENTS_SEPARATOR = ' || '


class FormatComments:
    def __init__(self, comments, admin_mapping):
        self.comments = comments
        self.admin_mapping = admin_mapping

    def format_comment_text(self, text):
        mentioned_user_ids = MENTION_REGEX.findall(text)
        if not mentioned_user_ids:
            return text

        for mentioned_user_id in mentioned_user_ids:
            admin_name = self.admin_mapping.get(mentioned_user_id, '')
            text_to_replace = f'@[userID:{mentioned_user_id}]'
            text = text.replace(text_to_replace, admin_name)
        return text

    def process(self):
        formatted_comments = []
        for comment in self.comments:
            text = self.format_comment_text(text=comment['text'])
            comment_info = f"{comment['created_by_name']}" \
                           f"{COMMENT_COMPONENT_SEPARATOR}" \
                           f"{comment['created_at']}" \
                           f"{COMMENT_COMPONENT_SEPARATOR}" \
                           f"{text}"
            comment_info = comment_info.replace('"', "'")
            formatted_comments.append(comment_info)
        return f'"{COMMENTS_SEPARATOR.join(formatted_comments)}"'

