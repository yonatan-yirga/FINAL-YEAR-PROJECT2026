# Grading System Enhancement - Requirements

## Overview
Upgrade the internship evaluation grading system from a simple 5-grade scale (A/B/C/D/F) to a detailed 12-grade scale with plus/minus modifiers to provide more granular performance assessment.

## Current System Analysis

### Current Grade Scale (5 grades)
| Grade | Score Range | Meaning |
|-------|-------------|---------|
| A | 90-100 | Excellent |
| B | 80-89 | Very Good |
| C | 70-79 | Good |
| D | 60-69 | Pass |
| F | <60 | Fail |

### Current Implementation Locations
1. **Backend - Models** (`Backend/apps/reports/models.py`)
   - `FinalReport.GRADE_CHOICES` - Grade options definition
   - `FinalReport.overall_grade` - CharField(max_length=1)
   - `FinalReport.calculate_total_grade()` - Grade calculation logic

2. **Backend - Database**
   - Migration: `Backend/apps/reports/migrations/0003_alter_finalreport_options_and_more.py`
   - Field: `overall_grade` CharField with max_length=1

3. **Backend - Serializers** (`Backend/apps/reports/serializers.py`)
   - `FinalReportSerializer.grade_label` - Display label for grades
   - `DepartmentHeadReportListSerializer.grade` - Grade field exposure

4. **Backend - Views** (`Backend/apps/reports/views.py`)
   - Returns `grade` and `grade_label` in API responses

5. **Backend - PDF Generator** (`Backend/apps/reports/pdf_generator.py`)
   - Grade color mapping for visual display
   - Grade labels in final report PDFs

6. **Backend - Certificate System**
   - `Certificate.performance_grade` - CharField(max_length=5) ✅ Already supports longer grades
   - `certificate_generator.py` - Grade display in certificates
   - Email notifications include grade information

7. **Frontend - Display Components**
   - Student dashboards showing grades
   - Advisor evaluation forms
   - Department head review interfaces
   - Certificate displays

## Proposed System

### New Grade Scale (12 grades)
| Grade | Score Range | Meaning |
|-------|-------------|---------|
| A+ | 90-100 | Outstanding |
| A | 85-89 | Excellent |
| A- | 80-84 | Very good |
| B+ | 75-79 | Good |
| B | 70-74 | Good |
| B- | 65-69 | Above average |
| C+ | 60-64 | Satisfactory |
| C | 50-59 | Pass |
| C- | 45-49 | Weak pass |
| D | 40-44 | Poor |
| F | <40 | Fail |

## Requirements

### Functional Requirements

#### FR1: Grade Calculation
- **FR1.1**: System shall calculate grades based on the new 12-grade scale
- **FR1.2**: Grade calculation logic shall use the exact score ranges specified
- **FR1.3**: Total score calculation method (40% monthly + 30% company + 30% advisor) shall remain unchanged
- **FR1.4**: Grade assignment shall be automatic based on `total_score` value

#### FR2: Grade Storage
- **FR2.1**: Database field shall support storing 2-character grade values (e.g., "A+", "A-", "B+")
- **FR2.2**: Existing grade data shall be preserved during migration
- **FR2.3**: Grade field shall enforce valid grade choices only

#### FR3: Grade Display
- **FR3.1**: All user interfaces shall display the new grade format with +/- modifiers
- **FR3.2**: Grade labels shall show both the grade and its meaning (e.g., "A+ - Outstanding")
- **FR3.3**: PDF reports shall display grades with appropriate visual styling
- **FR3.4**: Certificates shall display the new grade format

#### FR4: API Compatibility
- **FR4.1**: API responses shall include both `overall_grade` (e.g., "A+") and `grade_label` (e.g., "A+ - Outstanding")
- **FR4.2**: Existing API endpoints shall continue to function without breaking changes
- **FR4.3**: Frontend applications shall receive properly formatted grade data

#### FR5: Visual Presentation
- **FR5.1**: PDF reports shall use color coding for grade ranges:
  - A+/A/A-: Green shades (Outstanding/Excellent)
  - B+/B/B-: Blue shades (Good/Above Average)
  - C+/C/C-: Yellow/Orange shades (Satisfactory/Pass)
  - D: Gray (Poor)
  - F: Red (Fail)
- **FR5.2**: Grade badges in UI shall use appropriate color schemes
- **FR5.3**: Certificates shall display grades prominently with professional styling

### Non-Functional Requirements

#### NFR1: Data Integrity
- **NFR1.1**: Migration shall not lose or corrupt existing grade data
- **NFR1.2**: All existing reports shall remain accessible with their original grades
- **NFR1.3**: Grade recalculation shall be accurate to 2 decimal places

#### NFR2: Performance
- **NFR2.1**: Grade calculation shall complete within 100ms
- **NFR2.2**: Database queries shall not be negatively impacted by field changes
- **NFR2.3**: PDF generation time shall not increase significantly

#### NFR3: Maintainability
- **NFR3.1**: Grade scale shall be defined in a single location (DRY principle)
- **NFR3.2**: Adding future grade modifications shall require minimal code changes
- **NFR3.3**: Code shall include clear comments explaining grade calculation logic

#### NFR4: Compatibility
- **NFR4.1**: Changes shall be backward compatible with existing API consumers
- **NFR4.2**: Frontend components shall gracefully handle both old and new grade formats during transition
- **NFR4.3**: System shall work with existing database records

## Data Migration Strategy

### Existing Data Handling
1. **Preserve Existing Grades**: All current A/B/C/D/F grades remain valid
2. **No Automatic Conversion**: Existing grades will NOT be automatically converted to new scale
3. **New Calculations Only**: Only newly calculated reports will use the 12-grade scale
4. **Historical Accuracy**: Past evaluations maintain their original assessment

### Migration Approach
- **Option 1 (Recommended)**: Expand field to support 2 characters, keep existing data as-is
- **Option 2**: Add a new field for detailed grades, keep old field for compatibility
- **Decision**: Option 1 - simpler, cleaner, maintains single source of truth

## Affected Components Summary

### Backend Changes Required
1. ✅ **Models**: Update `GRADE_CHOICES` and `overall_grade` field
2. ✅ **Calculation Logic**: Update `calculate_total_grade()` method
3. ✅ **Database Migration**: Alter field to support 2-character grades
4. ✅ **Serializers**: Update grade label display logic
5. ✅ **PDF Generator**: Update color mapping and grade labels
6. ✅ **Certificate Generator**: Update grade display (already supports longer grades)
7. ✅ **Email Notifications**: Update grade display in emails

### Frontend Changes Required
1. ⚠️ **Grade Display Components**: Update to show +/- modifiers
2. ⚠️ **Color Schemes**: Update CSS for new grade ranges
3. ⚠️ **Evaluation Forms**: Ensure proper grade display
4. ⚠️ **Dashboard Views**: Update grade badges and labels

### Testing Requirements
1. **Unit Tests**: Grade calculation logic for all 12 grades
2. **Integration Tests**: End-to-end evaluation workflow
3. **Migration Tests**: Verify existing data preservation
4. **Visual Tests**: PDF and certificate generation
5. **API Tests**: Verify response format compatibility

## Success Criteria
1. ✅ All 12 grades calculate correctly based on score ranges
2. ✅ Existing reports maintain their original grades
3. ✅ New reports use the enhanced 12-grade scale
4. ✅ PDFs and certificates display grades correctly
5. ✅ No breaking changes to API contracts
6. ✅ All tests pass
7. ✅ Frontend displays grades with proper styling

## Constraints
- Must maintain backward compatibility with existing API consumers
- Cannot modify historical grade data
- Must complete within current sprint timeline
- No changes to score calculation methodology (40/30/30 weighting)

## Assumptions
- Frontend team can update UI components to display new grade format
- Database supports VARCHAR(2) or similar for grade storage
- Existing PDF generation library supports updated color schemes
- Users understand the new grading scale (documentation/training separate)

## Out of Scope
- Changing the score calculation methodology (40/30/30 remains)
- Retroactive recalculation of existing grades
- User training materials or documentation
- Grade appeal or override functionality
- Custom grade scales per department

## Dependencies
- Django ORM for database migrations
- ReportLab library for PDF generation
- Frontend framework (React) for UI updates
- Email service for notification updates

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | High | Low | Thorough testing, backup before migration |
| Frontend breaking changes | Medium | Medium | Maintain API compatibility, gradual rollout |
| User confusion with new scale | Medium | High | Clear documentation, training materials |
| PDF generation errors | Medium | Low | Comprehensive testing, fallback to simple display |
| Performance degradation | Low | Low | Performance testing, query optimization |

## Timeline Estimate
- Requirements Review: ✅ Complete
- Design Phase: 1 day
- Backend Implementation: 2 days
- Frontend Implementation: 2 days
- Testing & QA: 1 day
- Deployment: 0.5 days
- **Total**: ~6.5 days

## Approval
- [ ] Product Owner
- [ ] Technical Lead
- [ ] QA Lead
- [ ] Department Head Representative

---

**Document Version**: 1.0  
**Created**: 2026-04-23  
**Status**: Draft - Awaiting Review
