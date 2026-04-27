"""
Email Service
Handles sending HTML emails for various notification types
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Service class for sending HTML emails
    All methods return (success: bool, error: str|None)
    """
    
    @staticmethod
    def _send_html_email(recipient, subject, html_content):
        """
        Internal method to send HTML email
        Returns (success, error_message)
        """
        try:
            # Create plain text version
            text_content = strip_tags(html_content)
            
            send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f'Email sent successfully to {recipient}: {subject}')
            return True, None
            
        except Exception as e:
            error_msg = f'Failed to send email to {recipient}: {str(e)}'
            logger.error(error_msg)
            return False, error_msg
    
    @staticmethod
    def _create_html_email(title, content, button_text=None, button_url=None):
        """Create HTML email template"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .content {{
            padding: 30px;
        }}
        .content h2 {{
            color: #2d3748;
            font-size: 20px;
            margin-bottom: 15px;
        }}
        .content p {{
            color: #4a5568;
            margin-bottom: 15px;
        }}
        .button {{
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #5568d3;
        }}
        .footer {{
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }}
        .footer p {{
            margin: 5px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>University Internship System</h1>
        </div>
        <div class="content">
            <h2>{title}</h2>
            {content}
            {f'<a href="{button_url}" class="button">{button_text}</a>' if button_text and button_url else ''}
        </div>
        <div class="footer">
            <p>University Internship Management System</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        """
        return html
    
    @classmethod
    def send_registration_approved_email(cls, user, temp_password):
        """
        Send registration approved email with login credentials
        """
        # Safe CORS access
        try:
            login_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/login" if settings.CORS_ALLOWED_ORIGINS else "http://localhost:5173/login"
        except (IndexError, AttributeError):
            login_url = "http://localhost:5173/login"
        
        content = f"""
            <p>Congratulations! Your registration has been approved.</p>
            <p>You can now access the University Internship Management System using the following credentials:</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> {user.email}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #edf2f7; padding: 2px 6px; border-radius: 3px;">{temp_password}</code></p>
            </div>
            <p><strong>Important:</strong> Please change your password immediately after your first login.</p>
        """
        
        html = cls._create_html_email(
            title='Registration Approved!',
            content=content,
            button_text='Access Your Dashboard',
            button_url=login_url
        )
        
        return cls._send_html_email(
            recipient=user.email,
            subject='Registration Approved - Welcome to IMS',
            html_content=html
        )
    
    @classmethod
    def send_registration_rejected_email(cls, email, reason):
        """
        Send registration rejected email with reason
        """
        # Safe CORS access
        try:
            register_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/register" if settings.CORS_ALLOWED_ORIGINS else "http://localhost:5173/register"
        except (IndexError, AttributeError):
            register_url = "http://localhost:5173/register"
        
        content = f"""
            <p>Thank you for your interest in the University Internship Management System.</p>
            <p>After reviewing your registration, we need you to address the following issues:</p>
            <div style="background-color: #fff5f5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f56565;">
                <p style="margin: 0; color: #c53030;"><strong>Reason:</strong> {reason}</p>
            </div>
            <p>Please review the requirements and submit a new registration with the necessary corrections.</p>
        """
        
        html = cls._create_html_email(
            title='Registration Update Required',
            content=content,
            button_text='Resubmit Application',
            button_url=register_url
        )
        
        return cls._send_html_email(
            recipient=email,
            subject='Registration Update Required',
            html_content=html
        )

    @classmethod
    def send_registration_received_email(cls, email, request_type):
        """
        Send registration confirmation email to applicant
        """
        content = f"""
            <p>Thank you for registering with the University Internship Management System.</p>
            <p>Your <strong>{request_type}</strong> registration request has been successfully received and is now pending review by the UIL office.</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0;"><strong>Status:</strong> Pending Approval</p>
            </div>
            <p>You will receive an automated email notification once our team has reviewed your application. This typically takes 1-2 business days.</p>
        """
        
        html = cls._create_html_email(
            title='Registration Request Received',
            content=content
        )
        
        return cls._send_html_email(
            recipient=email,
            subject='Registration Received - University Internship System',
            html_content=html
        )

    @classmethod
    def send_new_registration_alert_to_uil(cls, uil_user, registration):
        """
        Send alert email to UIL office when a new registration is submitted
        """
        try:
            dashboard_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/uil/pending-registrations" if settings.CORS_ALLOWED_ORIGINS else "http://localhost:5173/uil/pending-registrations"
        except (IndexError, AttributeError):
            dashboard_url = "http://localhost:5173/uil/pending-registrations"

        applicant_name = (
            registration.student_full_name or 
            registration.company_name or 
            registration.advisor_full_name or 
            registration.department_name or 
            'N/A'
        )
        
        content = f"""
            <p>A new registration request has been submitted and requires your review.</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Applicant:</strong> {applicant_name}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> {registration.get_request_type_display()}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {registration.email}</p>
                <p style="margin: 5px 0;"><strong>Submitted:</strong> {registration.submitted_at.strftime('%B %d, %Y %H:%M')}</p>
            </div>
            <p>Please log in to the UIL dashboard to review and process this application.</p>
        """
        
        html = cls._create_html_email(
            title='New Registration Pending Review',
            content=content,
            button_text='Open UIL Dashboard',
            button_url=dashboard_url
        )
        
        return cls._send_html_email(
            recipient=uil_user.email,
            subject=f'New Registration Request: {applicant_name}',
            html_content=html
        )
    
    @classmethod
    def send_application_accepted_email(cls, student, internship):
        """
        Send application accepted email to student
        """
        internship_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/student/internships/{internship.id}"
        
        content = f"""
            <p>Congratulations! Your internship application has been accepted.</p>
            <div style="background-color: #f0fff4; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #48bb78;">
                <p style="margin: 5px 0;"><strong>Company:</strong> {internship.company.company_profile.company_name}</p>
                <p style="margin: 5px 0;"><strong>Position:</strong> {internship.title}</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> {internship.duration_months} months</p>
            </div>
            <p>Please check your dashboard for next steps and required documents.</p>
        """
        
        html = cls._create_html_email(
            title='Internship Application Accepted!',
            content=content,
            button_text='View Internship Details',
            button_url=internship_url
        )
        
        return cls._send_html_email(
            recipient=student.email,
            subject='Internship Application Accepted',
            html_content=html
        )
    
    @classmethod
    def send_application_rejected_email(cls, student, internship):
        """
        Send application rejected email to student
        """
        search_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/student/internships"
        
        content = f"""
            <p>Thank you for your interest in the internship position at {internship.company.company_profile.company_name}.</p>
            <p>After careful consideration, we regret to inform you that we have decided to proceed with other candidates for this position.</p>
            <p>We encourage you to continue exploring other opportunities in our system. Your skills and experience are valuable, and we wish you the best in your internship search.</p>
        """
        
        html = cls._create_html_email(
            title='Internship Application Update',
            content=content,
            button_text='Search Other Internships',
            button_url=search_url
        )
        
        return cls._send_html_email(
            recipient=student.email,
            subject='Internship Application Update',
            html_content=html
        )
    
    @classmethod
    def send_advisor_assigned_email(cls, student, advisor):
        """
        Send advisor assigned email to student
        """
        dashboard_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/student/dashboard"
        try:
            advisor_name = advisor.advisor_profile.full_name
            phone = advisor.advisor_profile.phone_number
        except Exception:
            advisor_name = advisor.get_full_name() or advisor.email
            phone = "Not provided"
        
        content = f"""
            <p>An advisor has been assigned to supervise your internship.</p>
            <div style="background-color: #ebf8ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4299e1;">
                <p style="margin: 5px 0;"><strong>Advisor Name:</strong> {advisor_name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {advisor.email}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> {phone}</p>
            </div>
            <p>Your advisor will guide you throughout your internship. Please feel free to reach out for any assistance.</p>
        """
        
        html = cls._create_html_email(
            title='Advisor Assigned to Your Internship',
            content=content,
            button_text='View My Internship',
            button_url=dashboard_url
        )
        
        return cls._send_html_email(
            recipient=student.email,
            subject='Advisor Assigned to Your Internship',
            html_content=html
        )
    
    @classmethod
    def send_feedback_received_email(cls, student, advisor):
        """
        Send feedback received email to student
        """
        dashboard_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/student/dashboard"
        try:
            advisor_name = advisor.advisor_profile.full_name
        except Exception:
            advisor_name = advisor.get_full_name() or advisor.email
        
        content = f"""
            <p>You have received new feedback from your advisor, {advisor_name}.</p>
            <p>Please review the feedback and continue working on your internship goals.</p>
        """
        
        html = cls._create_html_email(
            title='New Feedback from Your Advisor',
            content=content,
            button_text='Read Feedback',
            button_url=dashboard_url
        )
        
        return cls._send_html_email(
            recipient=student.email,
            subject='New Feedback from Your Advisor',
            html_content=html
        )
    
    @classmethod
    def send_monthly_report_submitted_email(cls, advisor, student, month):
        """
        Send monthly report submitted email to advisor
        """
        dashboard_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/advisor/dashboard"
        try:
            student_name = student.student_profile.full_name
        except Exception:
            student_name = student.get_full_name() or student.email
        
        content = f"""
            <p>A new monthly report has been submitted by {student_name}.</p>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Student:</strong> {student_name}</p>
                <p style="margin: 5px 0;"><strong>Month:</strong> {month}</p>
            </div>
            <p>Please review and provide feedback.</p>
        """
        
        html = cls._create_html_email(
            title='Monthly Report Submitted',
            content=content,
            button_text='View Report',
            button_url=dashboard_url
        )
        
        return cls._send_html_email(
            recipient=advisor.email,
            subject=f'Monthly Report Submitted - {student_name}',
            html_content=html
        )
    
    @classmethod
    def send_internship_completed_email(cls, student):
        """
        Send internship completed email to student
        """
        dashboard_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/student/dashboard"
        
        content = f"""
            <p>Congratulations on successfully completing your internship!</p>
            <p>We hope this experience has been valuable for your professional development.</p>
            <p>Your internship certificate is now available for download from your dashboard.</p>
            <p>We wish you all the best in your future endeavors!</p>
        """
        
        html = cls._create_html_email(
            title='Congratulations on Completing Your Internship!',
            content=content,
            button_text='Download Certificate',
            button_url=dashboard_url
        )
        
        return cls._send_html_email(
            recipient=student.email,
            subject='Internship Completed - Certificate Available',
            html_content=html
        )
    @classmethod
    def send_certificate_ready_email(cls, student, certificate):
        """
        Send congratulatory email with certificate details when PDF is ready.
        """
        try:
            frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
        except (AttributeError, IndexError):
            frontend_url = 'http://localhost:5173'

        cert_url  = f'{frontend_url}/student/congratulations'
        verify_url = f'{frontend_url}/verify-certificate/{certificate.verification_code}'

        try:
            student_name = student.student_profile.full_name
        except Exception:
            student_name = student.get_full_name() or student.email

        content = f"""
            <p>Dear {student_name},</p>
            <p>Congratulations! 🎉 Your internship completion certificate has been officially issued.</p>
            <table style="margin:16px 0;border-collapse:collapse;width:100%">
              <tr><td style="padding:6px 12px;font-weight:700;color:#0F2D5E;width:45%">Certificate ID</td>
                  <td style="padding:6px 12px">{certificate.certificate_id}</td></tr>
              <tr style="background:#f5f7fa"><td style="padding:6px 12px;font-weight:700;color:#0F2D5E">Company</td>
                  <td style="padding:6px 12px">{certificate.company_name}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:700;color:#0F2D5E">Position</td>
                  <td style="padding:6px 12px">{certificate.internship_title}</td></tr>
              <tr style="background:#f5f7fa"><td style="padding:6px 12px;font-weight:700;color:#0F2D5E">Issue Date</td>
                  <td style="padding:6px 12px">{certificate.issue_date.strftime('%B %d, %Y')}</td></tr>
              {'<tr><td style="padding:6px 12px;font-weight:700;color:#0F2D5E">Grade</td><td style="padding:6px 12px">' + certificate.performance_grade + '</td></tr>' if certificate.performance_grade else ''}
            </table>
            <p>You can verify your certificate at any time using your unique verification code:
            <strong>{certificate.verification_code}</strong></p>
            <p>We wish you all the best in your career!</p>
        """

        html = cls._create_html_email(
            title='Your Internship Certificate is Ready!',
            content=content,
            button_text='Download Certificate',
            button_url=cert_url,
        )

        return cls._send_html_email(
            recipient=student.email,
            subject=f'Certificate Ready — {certificate.certificate_id}',
            html_content=html,
        )

    # ── Phase 9: Final Report Email Notifications ──────────────────────────────

    @classmethod
    def send_final_report_pending_advisor_email(cls, advisor, student):
        """Notify advisor they need to complete the final report."""
        from django.conf import settings
        try:
            student_name = student.student_profile.full_name
        except Exception:
            student_name = student.get_full_name() or student.email
            
        try:
            url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/advisor/final-reports"
        except (AttributeError, IndexError):
            url = "http://localhost:5173/advisor/final-reports"

        content = f"""
            <p>The company has submitted their final evaluation for <strong>{student_name}</strong>.</p>
            <div style="background:#f7fafc;padding:15px;border-radius:6px;margin:15px 0;">
                <p style="margin:5px 0;"><strong>Student:</strong> {student_name}</p>
                <p style="margin:5px 0;"><strong>Action needed:</strong> Complete your advisor section</p>
            </div>
            <p>Please complete your evaluation section to finalise the internship report.</p>
        """

        html = cls._create_html_email(
            title='Final Report Awaiting Your Completion',
            content=content,
            button_text='Complete Report',
            button_url=url,
        )
        return cls._send_html_email(
            recipient=advisor.email,
            subject=f'Action Required: Final Report for {student_name}',
            html_content=html,
        )

    @classmethod
    def send_final_report_pending_department_head_email(cls, dept_head, student, advisor, report):
        """Notify department head that a final report is ready for review and approval."""
        from django.conf import settings
        try:
            student_name = student.get_full_name()
        except Exception:
            student_name = student.email
            
        try:
            url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/department/final-reports"
        except (AttributeError, IndexError):
            url = "http://localhost:5173/department/final-reports"

        content = f"""
            <p>A final internship report is ready for your review and approval.</p>
            <div style="background:#f7fafc;padding:15px;border-radius:6px;margin:15px 0;">
                <p style="margin:5px 0;"><strong>Student:</strong> {student_name}</p>
                <p style="margin:5px 0;"><strong>Advisor:</strong> {advisor.get_full_name()}</p>
                <p style="margin:5px 0;"><strong>Department:</strong> {student.department.name if student.department else 'N/A'}</p>
                <p style="margin:5px 0;"><strong>Final Grade:</strong> {report.overall_grade or 'Calculated'}</p>
            </div>
            <p>Please review the report and approve it for certificate generation, or send it back for revision if needed.</p>
        """

        html = cls._create_html_email(
            title='Final Report Ready for Review',
            content=content,
            button_text='Review Report',
            button_url=url,
        )
        return cls._send_html_email(
            recipient=dept_head.email,
            subject=f'Final Report Review Required — {student_name}',
            html_content=html,
        )

    @classmethod
    def send_final_report_completed_email(cls, dept_user, student, advisor):
        """Notify department head that the final report is fully completed."""
        from django.conf import settings
        try:
            student_name = student.get_full_name()
        except Exception:
            student_name = student.email
            
        try:
            url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/department/final-reports"
        except (AttributeError, IndexError):
            url = "http://localhost:5173/department/final-reports"

        content = f"""
            <p>The final internship evaluation report for <strong>{student_name}</strong>
            has been completed and is ready for your review.</p>
            <div style="background:#f7fafc;padding:15px;border-radius:6px;margin:15px 0;">
                <p style="margin:5px 0;"><strong>Student:</strong> {student_name}</p>
                <p style="margin:5px 0;"><strong>Completed by Advisor:</strong> {advisor.get_full_name()}</p>
                <p style="margin:5px 0;"><strong>Department:</strong> {student.department.name if student.department else 'N/A'}</p>
            </div>
            <p>Please review the report and approve it for certificate generation.</p>
        """

        html = cls._create_html_email(
            title='Final Internship Report Ready for Approval',
            content=content,
            button_text='Review & Approve',
            button_url=url,
        )
        return cls._send_html_email(
            recipient=dept_user.email,
            subject=f'Final Report Ready for Approval — {student_name}',
            html_content=html,
        )