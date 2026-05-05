"""
WebSocket Authentication Middleware
Handles Django Token authentication for WebSocket connections
"""
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from urllib.parse import parse_qs


@database_sync_to_async
def get_user_from_token(token_string):
    """
    Get user from Django Token (not JWT)
    """
    # Import here to avoid Django setup issues
    from django.contrib.auth.models import AnonymousUser
    from rest_framework.authtoken.models import Token
    
    try:
        # Get the token object
        token = Token.objects.select_related('user').get(key=token_string)
        
        # Return the associated user
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using Django Token
    """
    
    async def __call__(self, scope, receive, send):
        # Import here to avoid Django setup issues
        from django.contrib.auth.models import AnonymousUser
        
        # Get the token from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        # Authenticate user
        if token and token != 'null':
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """
    Helper function to wrap the ASGI application with Django Token auth middleware
    """
    return JWTAuthMiddleware(inner)
