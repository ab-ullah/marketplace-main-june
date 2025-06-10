"""
Middleware to log requests and responses when the status code is not 2XX
"""

import time
import json
import logging

from collections import OrderedDict

from django.urls import resolve

request_logger = logging.getLogger(__name__)


class RequestLogMiddleware:
    """Request Logging Middleware."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        capture_request = True
        start_time = time.time()
        log_data = OrderedDict()
        request_method = request.method
        request_path = request.get_full_path()

        # log_data = {
        #     "remote_address": request.META["REMOTE_ADDR"],
        #     "server_hostname": socket.gethostname(),
        #     "request_method": request.method,
        #     "request_path": request.get_full_path(),
        # }

        # Skip logging of health check endpoints
        if "/api/health/" in str(request.get_full_path()):
            capture_request = False

        req_body = {}
        content_type = request.META.get("CONTENT_TYPE", "")
        try:
            is_multipart = content_type.startswith("multipart/form-data")
            if is_multipart is False and request.body:
                req_body = json.loads(request.body.decode("utf-8"))
        except Exception:
            # Could not parse the request body
            req_body = {}

        response_body = {}
        response_status = 0
        # request passes on to controller
        response = self.get_response(request)

        if response:
            response_status = response.status_code

        # Only log the request and response for error causing requests
        if response and response_status > 399 and response["content-type"] == "application/json":
            response_body = json.loads(response.content.decode("utf-8"))

        # add runtime to our log_data
        run_time = time.time() - start_time

        view_name = resolve(request.path_info).func.__name__
        if capture_request:
            log_data["request_method"] = request_method
            log_data["request_path"] = request_path
            log_data["response_status"] = response_status
            log_data["run_time"] = run_time
            log_data['view_name'] = view_name

            # Our loggging security is access controlled, so we will log the request body
            # and response body to the logging stream. for cases where we are generating and 4XX or 5XX
            # responses.
            if response and response_status > 399:
                log_data["request_body"] = req_body
                log_data['response_body'] = response_body

            request_logger.info(msg=json.dumps(log_data))

        return response
