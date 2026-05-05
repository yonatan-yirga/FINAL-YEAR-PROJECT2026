"""
Message Model
Messaging between students, advisors, and companies within assignments.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Message(models.Model):
    """
    A message between participants in an advisor assignment (student, advisor, company).
    """
    advisor_assignment = models.ForeignKey(
        'advisors.AdvisorAssignment',
        on_delete=models.CASCADE,
        related_name='messages',
        help_text='The advisor assignment this conversation belongs to',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        help_text='User who sent this message',
    )
    content = models.TextField(
        help_text='Message content',
    )
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Whether the recipient has read this message',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['advisor_assignment', 'created_at']),
            models.Index(fields=['sender', 'is_read']),
        ]

    def __str__(self):
        return f"{self.sender.email} → {self.content[:50]}"

    def clean(self):
        super().clean()
        if self.sender and self.advisor_assignment:
            # Allow student, advisor, or company to send messages
            allowed = (
                self.sender == self.advisor_assignment.student or
                self.sender == self.advisor_assignment.advisor or
                (self.advisor_assignment.internship and 
                 self.sender == self.advisor_assignment.internship.company)
            )
            if not allowed:
                raise ValidationError(
                    'Only the student, advisor, or company in this assignment can send messages.'
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def recipient(self):
        """Return the other party in the conversation (for 2-party chats)."""
        if self.sender == self.advisor_assignment.student:
            return self.advisor_assignment.advisor
        return self.advisor_assignment.student
