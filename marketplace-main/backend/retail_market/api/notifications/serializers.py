from rest_framework import serializers

from api.documents.models import Document
from api.notifications.models import UserNotification

NOTIFICATION_DOCUMENT_TITLE_MAPPING = {
    UserNotification.NotificationTypeChoice.DISTRIBUTIONS.value: 'distribution',
    UserNotification.NotificationTypeChoice.CAPITAL_CALL.value: 'capital-call',
}


class NotificationSerializer(serializers.ModelSerializer):
    notification_type = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    fund_name = serializers.SerializerMethodField()
    fund_external_id = serializers.CharField(source='fund.external_id', default=None)
    investor_name = serializers.CharField(source='investor.name', default=None)
    fund_symbol = serializers.CharField(source='fund.symbol', default=None)

    class Meta:
        model = UserNotification
        exclude = ('modified_at',)

    @staticmethod
    def get_fund_name(obj: UserNotification):
        if obj.fund and obj.fund.display_name:
            return obj.fund.display_name
        elif obj.fund:
            return obj.fund.name

        return None

    @staticmethod
    def get_notification_type(obj: UserNotification):
        return obj.get_notification_type_display()

    @staticmethod
    def get_document_title(notification: UserNotification, notification_document: Document):
        notification_type = notification.notification_type
        if notification_type not in NOTIFICATION_DOCUMENT_TITLE_MAPPING or notification.is_admin_upload:
            return notification_document.title
        name = NOTIFICATION_DOCUMENT_TITLE_MAPPING[notification_type]
        return f'{name}.{notification_document.extension}'

    def get_documents(self, obj: UserNotification):
        documents = []
        for notification_doc in obj.documents.all():
            documents.append({
                'title': self.get_document_title(notification=obj, notification_document=notification_doc),
                'document_id': notification_doc.document_id,
                'name': notification_doc.document_path.rsplit('/', 1)[-1],
                'extension': notification_doc.extension,
            })
        return documents
