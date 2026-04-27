from django.core.mail import send_mail
from django.conf import settings
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

def send_email(
    subject: str,
    message: str,
    recipient_list: List[str],
    html_message: Optional[str] = None,
    fail_silently: bool = False
) -> int:
    """
    Send email to recipients
    
    Args:
        subject: Email subject
        message: Plain text message
        recipient_list: List of recipient email addresses
        html_message: HTML version of the message
        fail_silently: If False, raise exception on error
    
    Returns:
        Number of successfully sent emails
    """
    try:
        return send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=fail_silently
        )
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        if not fail_silently:
            raise
        return 0

def generate_unique_code(prefix: str, length: int = 8) -> str:
    """
    Generate a unique code with prefix
    
    Args:
        prefix: Prefix for the code
        length: Length of random part
    
    Returns:
        Unique code string
    """
    import random
    import string
    
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    return f"{prefix}{random_part}"
