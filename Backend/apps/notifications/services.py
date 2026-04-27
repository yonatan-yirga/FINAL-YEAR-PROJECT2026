"""
Notification Service
Combines in-app notifications and email notifications
"""
from .models import Notification
from .email_service import EmailService
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service class for creating and sending notifications
    Handles both in-app notifications and email notifications
    """

    @staticmethod
    def create_notification(recipient, title, message, notification_type='GENERAL',
                            link=None, related_object_id=None, related_object_type=None):
        """
        Create in-app notification
        Returns: Notification object or None on failure
        """
        try:
            notification = Notification.objects.create(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                link=link,
                related_object_id=related_object_id,
                related_object_type=related_object_type,
            )

            logger.info(f'In-app notification created for {recipient.email}: {title}')
            return notification

        except Exception as e:
            logger.error(f'Failed to create notification for {recipient.email}: {str(e)}')
            return None

    @staticmethod
    def send_notification_with_email(recipient, title, message, notification_type='GENERAL',
                                     link=None, email_func=None, email_args=None):
        """
        Create in-app notification AND send email

        Args:
            recipient: User object
            title: Notification title
            message: Notification message
            notification_type: Type of notification
            link: Optional link to related page
            email_func: EmailService method to call (e.g., EmailService.send_registration_approved_email)
            email_args: Arguments to pass to email function

        Returns:
            dict with 'notification' and 'email_sent' keys
        """
        result = {
            'notification': None,
            'email_sent': False,
            'email_error': None
        }

        # Always create in-app notification (this should never fail)
        notification = NotificationService.create_notification(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            link=link
        )
        result['notification'] = notification

        # Send email if email function provided
        if email_func and email_args:
            try:
                # Call email function synchronously
                email_success, email_error = email_func(*email_args)
                result['email_sent'] = email_success
                result['email_error'] = email_error
            except Exception as e:
                result['email_error'] = str(e)
                logger.error(f'Email sending failed: {str(e)}')

        return result

    @classmethod
    def notify_registration_approved(cls, user, temp_password):
        """
        Notify user that their registration was approved
        Creates in-app notification + sends email
        """
        title = 'Registration Approved!'
        message = f'Welcome to the Internship Management System. Your temporary password is: {temp_password}. Please login and change it immediately.'
        link = '/login'

        return cls.send_notification_with_email(
            recipient=user,
            title=title,
            message=message,
            notification_type='REGISTRATION_APPROVED',
            link=link,
            email_func=EmailService.send_registration_approved_email,
            email_args=(user, temp_password)
        )

    @classmethod
    def notify_registration_submitted(cls, registration):
        """
        Notify both the applicant and the UIL office about a new registration
        """
        from apps.accounts.models import User
        
        # 1. Send confirmation to applicant
        try:
            EmailService.send_registration_received_email(
                registration.email, 
                registration.get_request_type_display()
            )
        except Exception as e:
            logger.error(f'Failed to send registration confirmation to {registration.email}: {e}')

        # 2. Notify all UIL staff
        applicant_name = (
            registration.student_full_name or 
            registration.company_name or 
            registration.advisor_full_name or 
            registration.department_name or 
            'Applicant'
        )
        
        title = 'New Registration Pending'
        message = f'A new {registration.get_request_type_display()} registration from {applicant_name} requires your review.'
        link = '/uil/pending-registrations'

        uil_users = User.objects.filter(role='UIL', is_active=True)
        for uil_user in uil_users:
            try:
                cls.send_notification_with_email(
                    recipient=uil_user,
                    title=title,
                    message=message,
                    notification_type='GENERAL',
                    link=link,
                    email_func=EmailService.send_new_registration_alert_to_uil,
                    email_args=(uil_user, registration)
                )
            except Exception as e:
                logger.error(f'Failed to notify UIL user {uil_user.email} about new registration: {e}')

    @classmethod
    def notify_registration_rejected(cls, email, reason):
        """
        Notify user (via email only) that their registration was rejected
        No in-app notification since user doesn't have an account yet
        """
        try:
            success, error = EmailService.send_registration_rejected_email(email, reason)
            return {
                'email_sent': success,
                'email_error': error
            }
        except Exception as e:
            logger.error(f'Failed to send rejection email to {email}: {str(e)}')
            return {
                'email_sent': False,
                'email_error': str(e)
            }

    @classmethod
    def notify_application_accepted(cls, student, internship):
        """
        Notify student that their application was accepted
        """
        company_name = internship.company.company_profile.company_name
        title = 'Internship Application Accepted!'
        message = f'Congratulations! Your application for {internship.title} at {company_name} has been accepted.'
        link = f'/student/internships/{internship.id}'

        return cls.send_notification_with_email(
            recipient=student,
            title=title,
            message=message,
            notification_type='APPLICATION_ACCEPTED',
            link=link,
            email_func=EmailService.send_application_accepted_email,
            email_args=(student, internship)
        )

    @classmethod
    def notify_application_rejected(cls, student, internship):
        """
        Notify student that their application was rejected
        """
        company_name = internship.company.company_profile.company_name
        title = 'Internship Application Update'
        message = f'Thank you for your interest. We have decided to proceed with other candidates for the {internship.title} position at {company_name}.'
        link = '/student/applications'

        return cls.send_notification_with_email(
            recipient=student,
            title=title,
            message=message,
            notification_type='APPLICATION_REJECTED',
            link=link,
            email_func=EmailService.send_application_rejected_email,
            email_args=(student, internship)
        )

    @classmethod
    def notify_application_submitted(cls, company, student, internship):
        """
        Notify company that a student has applied.
        In-app notification only — email notification not yet implemented for this event.
        """
        student_name = student.student_profile.full_name
        title = 'New Application Received'
        message = f'{student_name} has applied for {internship.title}. Please review the application.'
        link = '/company/applications'

        return cls.send_notification_with_email(
            recipient=company,
            title=title,
            message=message,
            notification_type='GENERAL',
            link=link,
            email_func=None,
            email_args=None,
        )

    @classmethod
    def notify_advisor_assigned(cls, student, advisor):
        """
        Notify student that an advisor has been assigned
        """
        advisor_name = advisor.advisor_profile.full_name
        title = 'Advisor Assigned'
        message = f'{advisor_name} has been assigned as your internship advisor.'
        link = '/student/active-internship'

        return cls.send_notification_with_email(
            recipient=student,
            title=title,
            message=message,
            notification_type='ADVISOR_ASSIGNED',
            link=link,
            email_func=EmailService.send_advisor_assigned_email,
            email_args=(student, advisor)
        )

    @classmethod
    def notify_feedback_received(cls, student, advisor):
        """
        Notify student that they received feedback from advisor
        """
        advisor_name = advisor.advisor_profile.full_name
        title = 'New Feedback Received'
        message = f'You have received new feedback from {advisor_name}. Please review it in your dashboard.'
        link = '/student/active-internship'

        return cls.send_notification_with_email(
            recipient=student,
            title=title,
            message=message,
            notification_type='FEEDBACK_RECEIVED',
            link=link,
            email_func=EmailService.send_feedback_received_email,
            email_args=(student, advisor)
        )

    @classmethod
    def notify_report_submitted(cls, advisor, student, month):
        """
        Notify advisor that student submitted a monthly report
        """
        try:
            student_name = student.student_profile.full_name
        except Exception:
            student_name = student.get_full_name() or student.email

        title = 'Monthly Report Submitted'
        message = f'{student_name} has submitted their monthly report for {month}. Please review and provide feedback.'
        link = '/advisor/reports'

        return cls.send_notification_with_email(
            recipient=advisor,
            title=title,
            message=message,
            notification_type='REPORT_SUBMITTED',
            link=link,
            email_func=EmailService.send_monthly_report_submitted_email,
            email_args=(advisor, student, month)
        )

    # ── Phase 9: Final Report Notifications ───────────────────────────────────

    @classmethod
    def notify_final_report_pending_advisor(cls, advisor, student, report_id):
        """
        Notify advisor that the company has submitted their final evaluation
        and the advisor needs to complete their section.
        """
        student_name = student.student_profile.full_name
        title = 'Final Report Awaiting Your Completion'
        message = (
            f"{student_name}'s company has submitted their final evaluation. "
            f'Please complete your section to finalise the report.'
        )
        link = '/advisor/final-reports'

        return cls.send_notification_with_email(
            recipient=advisor,
            title=title,
            message=message,
            notification_type='REPORT_SUBMITTED',   # reuse existing type — no migration needed
            link=link,
            email_func=EmailService.send_final_report_pending_advisor_email,
            email_args=(advisor, student),
        )

    @classmethod
    def notify_final_report_pending_department_head(cls, student, advisor, report):
        """
        Notify department head that a final report is ready for review
        """
        from apps.accounts.models import User

        student_name = student.get_full_name()
        advisor_name = advisor.get_full_name()
        title = 'Final Report Ready for Review'
        message = (
            f'The final internship report for {student_name} has been completed '
            f'by advisor {advisor_name} and is ready for your review and approval.'
        )
        link = '/department/final-reports'

        # Notify all department heads in the student's department
        dept_heads = User.objects.filter(
            role='DEPARTMENT_HEAD',
            department=student.department,
            is_active=True,
            is_approved=True,
        )
        
        for dept_head in dept_heads:
            try:
                cls.send_notification_with_email(
                    recipient=dept_head,
                    title=title,
                    message=message,
                    notification_type='FINAL_REPORT_PENDING_REVIEW',
                    link=link,
                    email_func=EmailService.send_final_report_pending_department_head_email,
                    email_args=(dept_head, student, advisor, report),
                )
            except Exception as e:
                logger.error(
                    f'Failed to notify department head {dept_head.email} '
                    f'for final report {report.id}: {e}'
                )

    @classmethod
    def notify_final_report_completed(cls, student, advisor, report_id):
        """
        Notify all DEPARTMENT_HEAD users in the student's department that
        the final internship report has been fully completed.
        """
        from apps.accounts.models import User

        student_name = student.get_full_name()
        title = 'Final Report Completed'
        message = (
            f'The final internship report for {student_name} has been completed '
            f'by {advisor.get_full_name()}. Please review and approve for certificate generation.'
        )
        link = '/department/final-reports'

        dept_users = User.objects.filter(
            role='DEPARTMENT_HEAD',
            department=student.department,
            is_approved=True,
        )
        for dept_user in dept_users:
            try:
                cls.send_notification_with_email(
                    recipient=dept_user,
                    title=title,
                    message=message,
                    notification_type='REPORT_SUBMITTED',
                    link=link,
                    email_func=EmailService.send_final_report_completed_email,
                    email_args=(dept_user, student, advisor),
                )
            except Exception as e:
                logger.error(
                    f'Failed to notify dept user {dept_user.email} '
                    f'for final report {report_id}: {e}'
                )

    @classmethod
    def notify_internship_completed(cls, student):
        """
        Notify student that their internship is complete
        """
        title = 'Internship Completed!'
        message = 'Congratulations on completing your internship! Your certificate is now available for download.'
        link = '/student/dashboard'

        return cls.send_notification_with_email(
            recipient=student,
            title=title,
            message=message,
            notification_type='INTERNSHIP_COMPLETED',
            link=link,
            email_func=EmailService.send_internship_completed_email,
            email_args=(student,)
        )

    @staticmethod
    def mark_notification_as_read(notification_id, user):
        """
        Mark a single notification as read
        """
        try:
            notification = Notification.objects.get(id=notification_id, recipient=user)
            notification.mark_as_read()
            return True, None
        except Notification.DoesNotExist:
            return False, 'Notification not found'
        except Exception as e:
            logger.error(f'Failed to mark notification as read: {str(e)}')
            return False, str(e)

    @staticmethod
    def mark_all_as_read(user):
        """
        Mark all notifications as read for a user
        """
        try:
            updated = Notification.objects.filter(
                recipient=user,
                is_read=False
            ).update(is_read=True)

            logger.info(f'Marked {updated} notifications as read for {user.email}')
            return updated, None
        except Exception as e:
            logger.error(f'Failed to mark all notifications as read: {str(e)}')
            return 0, str(e)

    @staticmethod
    def delete_notification(notification_id, user):
        """
        Delete a single notification
        """
        try:
            notification = Notification.objects.get(id=notification_id, recipient=user)
            notification.delete()
            return True, None
        except Notification.DoesNotExist:
            return False, 'Notification not found'
        except Exception as e:
            logger.error(f'Failed to delete notification: {str(e)}')
            return False, str(e)

    @staticmethod
    def get_unread_count(user):
        """
        Get count of unread notifications for a user
        """
        try:
            count = Notification.objects.filter(
                recipient=user,
                is_read=False
            ).count()
            return count
        except Exception as e:
            logger.error(f'Failed to get unread count: {str(e)}')
            return 0