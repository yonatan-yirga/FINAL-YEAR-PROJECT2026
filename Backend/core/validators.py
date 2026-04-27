import os
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


def validate_pdf_file(file):
    """
    Validate that the uploaded file is a PDF and within size limit
    
    Args:
        file: Uploaded file object
    
    Raises:
        ValidationError: If file is not valid
    """
    # Check file extension
    ext = os.path.splitext(file.name)[1].lower()
    if ext != '.pdf':
        raise ValidationError('Only PDF files are allowed.')
    
    # Check file size (5MB limit)
    max_size_mb = 5
    max_size_bytes = max_size_mb * 1024 * 1024
    
    if file.size > max_size_bytes:
        raise ValidationError(f'File size cannot exceed {max_size_mb}MB. Current size: {file.size / (1024 * 1024):.2f}MB')
    
    # Check MIME type (additional security)
    # Note: This requires python-magic or similar library for production
    # For now, we rely on extension checking
    
    return file


def validate_file_size(file, max_size_mb=5):
    """
    Validate file size
    
    Args:
        file: Uploaded file object
        max_size_mb: Maximum size in megabytes
    
    Raises:
        ValidationError: If file exceeds size limit
    """
    max_size_bytes = max_size_mb * 1024 * 1024
    
    if file.size > max_size_bytes:
        raise ValidationError(
            f'File size cannot exceed {max_size_mb}MB. '
            f'Current size: {file.size / (1024 * 1024):.2f}MB'
        )
    
    return file


def validate_image_file(file):
    """
    Validate that the uploaded file is an image
    
    Args:
        file: Uploaded file object
    
    Raises:
        ValidationError: If file is not a valid image
    """
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    ext = os.path.splitext(file.name)[1].lower()
    
    if ext not in valid_extensions:
        raise ValidationError(
            f'Invalid file extension. Allowed extensions: {", ".join(valid_extensions)}'
        )
    
    # Check file size (5MB limit for images)
    validate_file_size(file, max_size_mb=5)
    
    return file