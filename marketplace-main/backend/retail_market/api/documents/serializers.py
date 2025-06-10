from rest_framework import serializers

from api.documents.models import Document, InvestorDocument, FundDocument
from api.notifications.models import UserNotification

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('title', 'document_id', 'id')


class DocumentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'


class FundInvestorDocumentsSerializer(serializers.ModelSerializer):
    document_type = serializers.SerializerMethodField()
    investor = serializers.SerializerMethodField()
    investor_fund = serializers.SerializerMethodField()
    fund = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'

    @staticmethod
    def get_document_type(obj: Document):
        return obj.get_document_type_display()

    @staticmethod
    def get_investor(obj: Document):
        try:
            investor = InvestorDocument.objects.get(document=obj).investor
            return {
                'id': investor.id,
                'name': investor.name,
                'partner_id': investor.partner_id,
                'investor_account_code': investor.investor_account_code,
            }
        except:
            return None

    @staticmethod
    def get_fund(obj: Document):
        try:
            fund = FundDocument.objects.get(document=obj).fund
            return {
                'id': fund.id,
                'name': fund.name,
                'partner_id': fund.partner_id
            }
        except:
            return None

    @staticmethod
    def get_investor_fund(obj: Document):
        try:
            fund = InvestorDocument.objects.get(document=obj).fund
            return {
                'id': fund.id,
                'name': fund.name,
                'partner_id': fund.partner_id
            }
        except:
            return None

    @staticmethod
    def get_due_date(obj: Document):
        try:
            notification = UserNotification.objects.filter(documents=obj).first()
            return notification.due_date
        except:
            return None



