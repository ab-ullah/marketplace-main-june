from rest_framework.generics import ListAPIView, CreateAPIView

from api.mixins.admin_view_mixin import AdminViewMixin
from api.notices.admin_views.serializers import NoticeDocumentSerializer


class NoticeCreateView(AdminViewMixin, CreateAPIView):
    serializer_class = NoticeDocumentSerializer
