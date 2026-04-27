"""
Department management endpoints
"""
from django.urls import path
from .views import DepartmentViewSet

# Department endpoints (no router needed, using ViewSet as view)
urlpatterns = [
    # Statistics
    path('statistics/', DepartmentViewSet.as_view({'get': 'statistics'}), name='department-statistics'),
    
    # Lists
    path('students/', DepartmentViewSet.as_view({'get': 'students'}), name='department-students'),
    path('advisors/', DepartmentViewSet.as_view({'get': 'advisors'}), name='department-advisors'),
    path('companies/', DepartmentViewSet.as_view({'get': 'companies'}), name='department-companies'),
    
    # Advisor Assignment
    path('unassigned-students/', DepartmentViewSet.as_view({'get': 'unassigned_students'}), name='department-unassigned-students'),
    path('assign-advisor/', DepartmentViewSet.as_view({'post': 'assign_advisor'}), name='department-assign-advisor'),
    path('add-advisor/', DepartmentViewSet.as_view({'post': 'add_advisor'}), name='department-add-advisor'),
    
    # Company Assignment (Direct Placement)
    path('assign-company/', DepartmentViewSet.as_view({'post': 'assign_company'}), name='department-assign-company'),
    
    # Reports
    path('reports/', DepartmentViewSet.as_view({'get': 'reports'}), name='department-reports'),
    
    # Decision Intelligence
    path('decision-intelligence/', DepartmentViewSet.as_view({'get': 'decision_intelligence'}), name='department-decision-intelligence'),
    
    # Validate Students
    path('validate-students/', DepartmentViewSet.as_view({'post': 'validate_students'}), name='department-validate-students'),
    
    # PHASE 3.3: NEW ROUTES
    # Activity Feed
    path('activity/', DepartmentViewSet.as_view({'get': 'activity'}), name='department-activity'),
    
    # Mark Student Completed
    path('students/<int:pk>/complete/', DepartmentViewSet.as_view({'post': 'mark_completed'}), name='department-mark-completed'),
    
    # Cycle Management
    path('cycles/', DepartmentViewSet.as_view({'get': 'cycles'}), name='department-cycles'),
    path('cycles/create/', DepartmentViewSet.as_view({'post': 'create_cycle'}), name='department-create-cycle'),
    path('<int:pk>/cycles/update/', DepartmentViewSet.as_view({'put': 'update_cycle'}), name='department-update-cycle'),
    path('<int:pk>/cycles/activate/', DepartmentViewSet.as_view({'post': 'activate_cycle'}), name='department-activate-cycle'),
    path('<int:pk>/cycles/close/', DepartmentViewSet.as_view({'post': 'close_cycle'}), name='department-close-cycle'),
    path('<int:pk>/cycles/delete/', DepartmentViewSet.as_view({'delete': 'delete_cycle'}), name='department-delete-cycle'),
    
    # Escalation Management
    path('escalations/', DepartmentViewSet.as_view({'get': 'escalations'}), name='department-escalations'),
    path('escalations/create/', DepartmentViewSet.as_view({'post': 'create_escalation'}), name='department-create-escalation'),
    path('<int:pk>/escalations/resolve/', DepartmentViewSet.as_view({'post': 'resolve_escalation'}), name='department-resolve-escalation'),
    path('<int:pk>/escalations/escalate-to-uil/', DepartmentViewSet.as_view({'post': 'escalate_to_uil'}), name='department-escalate-to-uil'),
]