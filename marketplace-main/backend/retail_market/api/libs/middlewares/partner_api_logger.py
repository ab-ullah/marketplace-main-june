"""
Middleware to log requests and responses when the status code is not 2XX
"""

import time
import json
import logging

from django.urls import resolve

from api.partners.models import PartnerAPILog

request_logger = logging.getLogger(__name__)


class PartnerAPILogMiddleware:
    """Request Logging Middleware."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        capture_request = True
        start_time = time.time()
        request_method = request.method
        request_path = request.get_full_path()

        # Skip logging of health check endpoints
        if "partners/" not in str(request.get_full_path()):
            capture_request = False

        req_body = {}
        content_type = request.META.get("CONTENT_TYPE", "")
        try:
            is_multipart = content_type.startswith("multipart/form-data")
            if is_multipart is False and request.body:
                req_body = json.loads(request.body.decode("utf-8"))
            if is_multipart:
                req_body = request.POST
        except Exception:
            # Could not parse the request body
            body = getattr(request, 'body', None)
            if body:
                req_body = {"message": "request body could not be parsed", "request_body": str(request.body)}
            else:
                req_body = {"message": "request does not have body"}
        # request passes on to controller
        response = self.get_response(request)

        run_time = time.time() - start_time
        view_name = resolve(request.path_info).func.__name__
        if capture_request and request.company and response:
            PartnerAPILog.objects.create(
                company=request.company,
                request_body=req_body,
                request_method=request_method,
                request_path=request_path,
                response_body=response.content.decode("utf-8"),
                response_status=response.status_code,
                run_time=run_time,
                view_name=view_name

            )

        return response
