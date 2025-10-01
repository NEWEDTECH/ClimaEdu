# Class Assessment Performance Report

## Overview

The **Class Assessment Performance Report** provides tutors with comprehensive insights into how their students are performing on assessments, quizzes, and evaluations. This report helps identify learning gaps, track progress trends, and make data-driven decisions to improve educational outcomes.

## Target Audience

- **Tutors** monitoring their assigned classes
- **Academic Coordinators** overseeing multiple tutors

## Key Features

### 📊 Assessment Overview
- Total number of assessments and submissions
- Class average score and pass rate
- Overall completion rate
- Average number of attempts per assessment

### 📈 Assessment Statistics
- Individual assessment performance metrics
- Difficulty level classification (Easy/Medium/Hard)
- Standard deviation and score distribution
- Time spent analysis per assessment

### 👥 Student Performance Analysis
- Individual student performance tracking
- Risk level identification (Low/Medium/High)
- Improvement trend analysis (Improving/Stable/Declining)
- Best and worst performing students

### 🔍 Question-Level Analysis
- Success rate per question
- Common wrong answers identification
- Question difficulty and discrimination indices
- Time spent per question analysis

### 📅 Performance Trends
- Score trends over time
- Participation rate changes
- Pass rate evolution
- Submission patterns

### 🏆 Class Comparison
- Performance vs institution average
- Performance vs course average
- Percentile ranking
- Performance rating classification

### 💡 Smart Recommendations
- Content review suggestions
- Individual support recommendations
- Assessment adjustment proposals
- Group activity suggestions

## Data Sources

- **QuestionnaireSubmission**: Assessment scores and attempts
- **Questionnaire**: Assessment metadata and questions
- **Class**: Class information and enrollment
- **User**: Student information
- **Course**: Course context and structure

## Report Sections

### 1. Class Information
```typescript
{
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  tutorId: string;
  tutorName: string;
  totalStudents: number;
  activeStudents: number;
}
```

### 2. Assessment Overview
```typescript
{
  totalAssessments: number;
  totalSubmissions: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
  averageAttempts: number;
}
```

### 3. Assessment Statistics
```typescript
{
  assessmentId: string;
  assessmentName: string;
  assessmentType: 'QUIZ' | 'EXAM' | 'ASSIGNMENT';
  totalSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  standardDeviation: number;
  passRate: number;
  averageTimeSpent: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
}
```

### 4. Student Performance
```typescript
{
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastSubmissionDate: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

### 5. Insights & Recommendations
- **Top Performers**: Students with highest average scores
- **Struggling Students**: Students requiring additional support
- **Difficult Assessments**: Assessments with low average scores
- **Easy Assessments**: Assessments with high success rates
- **Improvement Opportunities**: Actionable insights for enhancement
- **Strengths**: Areas where the class excels

## Filtering Options

### Assessment Type Filter
- Quiz assessments only
- Exam assessments only
- Assignment assessments only
- All assessment types

### Date Range Filter
- Custom date range selection
- Last 30 days
- Last semester
- Current academic period

### Grouping Options
- Group by assessment
- Group by student
- Group by topic/subject
- Group by date period

### Detail Level
- Include individual scores
- Include statistical analysis
- Include trend analysis
- Include question-level analysis

## Use Cases

### 1. Identifying Struggling Students
```typescript
const report = await generateClassAssessmentPerformanceReport({
  tutorId: 'tutor-123',
  institutionId: 'inst-456',
  classId: 'class-789',
  includeIndividualScores: true,
  includeStatistics: true
});

const strugglingStudents = report.insights.strugglingStudents;
// Take action for high-risk students
```

### 2. Assessment Difficulty Analysis
```typescript
const report = await generateClassAssessmentPerformanceReport({
  tutorId: 'tutor-123',
  institutionId: 'inst-456',
  classId: 'class-789',
  includeStatistics: true,
  includeQuestionAnalysis: true
});

const difficultAssessments = report.insights.mostDifficultAssessments;
// Review and adjust difficult assessments
```

### 3. Progress Tracking
```typescript
const report = await generateClassAssessmentPerformanceReport({
  tutorId: 'tutor-123',
  institutionId: 'inst-456',
  classId: 'class-789',
  includeTrends: true,
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date('2024-12-31')
});

const trends = report.performanceTrends;
// Monitor progress over time
```

## Business Rules

### Access Control
- Tutors can only access reports for their assigned classes
- Reports are filtered by institution for tenant isolation
- Class-tutor relationship validation is required

### Data Privacy
- Student personal information is limited to name and email
- Individual scores are only shown to authorized tutors
- Aggregated data maintains student anonymity where possible

### Performance Thresholds
- **Pass Rate**: 60% or higher score
- **Risk Levels**:
  - Low Risk: Average score ≥ 75%
  - Medium Risk: Average score 60-74%
  - High Risk: Average score < 60%
- **Difficulty Classification**:
  - Easy: Average score ≥ 80%
  - Medium: Average score 60-79%
  - Hard: Average score < 60%

## Implementation Notes

### CQRS Pattern
This report follows the CQRS pattern:
- No domain entities are used
- Direct repository queries for data aggregation
- Read-only data transformation and formatting
- Dependency injection for repository access

### Performance Considerations
- Large classes may require pagination
- Complex statistical calculations may need caching
- Question-level analysis can be computationally intensive
- Consider async processing for detailed reports

### Error Handling
- Validate tutor access to class before processing
- Handle cases with no assessment data gracefully
- Provide meaningful error messages for invalid filters
- Log performance metrics for monitoring

## Related Reports

- **Individual Student Tracking**: Detailed view of single student
- **Class Overview Report**: General class health metrics
- **Student Engagement & Retention**: Participation and dropout analysis
- **Quality Report**: Institution-wide assessment quality metrics
