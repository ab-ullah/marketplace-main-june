from rest_framework.generics import get_object_or_404

from api.applications.models import Application


class ApplicationViewMixin:
    @property
    def get_application(self):
        application_id = self.request.GET.get('application_id')
        if not application_id:
            return None

        return get_object_or_404(
            Application,
            id=application_id,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['application'] = self.get_application
        return context
