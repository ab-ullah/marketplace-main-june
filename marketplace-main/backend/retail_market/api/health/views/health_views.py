from django.http import JsonResponse
from django.views.decorators.cache import never_cache
from health_check.mixins import CheckMixin
from rest_framework import status
from rest_framework.views import APIView


class HealthAPIView(CheckMixin, APIView):
    permission_classes = ()

    @never_cache
    def get(self, request, *args, **kwargs):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE if self.errors else status.HTTP_200_OK
        return self.render_to_response_json(self.plugins, status_code)

    def render_to_response_json(self, plugins, status_code):
        return JsonResponse(
            {str(p.identifier()): str(p.pretty_status()) for p in plugins},
            status=status_code
        )
