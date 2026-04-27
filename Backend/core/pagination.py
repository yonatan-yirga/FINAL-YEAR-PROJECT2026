"""
Pagination Classes
Custom pagination configurations for different views
"""
from rest_framework.pagination import PageNumberPagination


class DepartmentPagination(PageNumberPagination):
    """
    Pagination class for department-related endpoints
    Used for large datasets like student lists, advisor lists, etc.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response_schema(self, schema):
        """Override to provide better API documentation"""
        return {
            'type': 'object',
            'properties': {
                'count': {
                    'type': 'integer',
                    'example': 123,
                },
                'next': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'example': 'http://api.example.org/accounts/?page=4',
                },
                'previous': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'example': 'http://api.example.org/accounts/?page=2',
                },
                'results': schema,
            },
        }


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class for general use
    Default for most list endpoints
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination class for large datasets
    Used for reports, applications, etc.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200