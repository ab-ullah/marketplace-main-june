from rest_framework.pagination import CursorPagination
from rest_framework.response import Response


class CustomPagination(CursorPagination):
    page_size = 50
    ordering = '-created_at'

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link()
            },
            'results': data
        })
