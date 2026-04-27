from rest_framework.exceptions import APIException
from rest_framework import status

class DepartmentMismatchError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access resources from other departments.'
    default_code = 'department_mismatch'

class FileUploadError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'File upload failed. Please check file format and size.'
    default_code = 'file_upload_error'

class EmailSendError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Failed to send email notification.'
    default_code = 'email_send_error'

class PDFGenerationError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Failed to generate PDF document.'
    default_code = 'pdf_generation_error'
