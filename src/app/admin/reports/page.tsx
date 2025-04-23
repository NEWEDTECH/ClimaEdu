'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { Progress } from '@/components/ui/helpers/progress'
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })


export default function ReportsPage() {

  const progressChartOptions = {
    chart: {
      id: 'student-progress-chart',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    },
    colors: ['#0ea5e9'],
    stroke: {
      curve: 'smooth' as const,
    },
    markers: {
      size: 5,
    },
  }

  const progressChartSeries = [
    {
      name: 'Progress (%)',
      data: [10, 25, 30, 45, 60, 75, 80, 85],
    },
  ]

  const assessmentChartOptions = {
    chart: {
      id: 'class-assessment-chart',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: ['Quiz 1', 'Assignment 1', 'Quiz 2', 'Project', 'Quiz 3', 'Final Exam'],
    },
    colors: ['#0ea5e9', '#f97316'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
  }

  const assessmentChartSeries = [
    {
      name: 'Class Average (%)',
      data: [75, 68, 82, 70, 85, 78],
    },
    {
      name: 'Completion Rate (%)',
      data: [95, 85, 90, 75, 80, 70],
    },
  ]

  const activityChartOptions = {
    chart: {
      id: 'activity-distribution-chart',
      toolbar: {
        show: false,
      },
    },
    labels: ['Videos', 'Readings', 'Quizzes', 'Assignments', 'Discussion'],
    colors: ['#0ea5e9', '#f97316', '#8b5cf6', '#22c55e', '#f43f5e'],
    legend: {
      position: 'bottom' as const,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom' as const,
          },
        },
      },
    ],
  }

  const activityChartSeries = [35, 20, 25, 15, 5]

  const completionChartOptions = {
    chart: {
      id: 'completion-status-chart',
      toolbar: {
        show: false,
      },
    },
    labels: ['Completed', 'In Progress', 'Not Started'],
    colors: ['#22c55e', '#f97316', '#94a3b8'],
    legend: {
      position: 'bottom' as const,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom' as const,
          },
        },
      },
    ],
  }

  const completionChartSeries = [65, 25, 10]

  const studentDetails = {
    progress: 85,
    lastActivity: '2025-04-10',
    completedModules: 7,
    totalModules: 8,
    averageScore: 78,
    timeSpent: '32h 45m',
  }

  const classDetails = {
    enrolledStudents: 28,
    averageProgress: 72,
    averageScore: 76,
    completionRate: 65,
    mostChallenging: 'Project Submission (Week 6)',
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <h1 className="text-3xl font-bold">Reports Dashboard</h1>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="student">Student Progress</TabsTrigger>
              <TabsTrigger value="class">Class Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentDetails.progress}%</div>
                    <Progress value={studentDetails.progress} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {studentDetails.completedModules} of {studentDetails.totalModules} modules completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentDetails.averageScore}%</div>
                    <Progress value={studentDetails.averageScore} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on all completed assessments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{new Date(studentDetails.lastActivity).toLocaleDateString()}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date().getDate() - new Date(studentDetails.lastActivity).getDate()} days ago
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentDetails.timeSpent}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total time in course
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Over Time</CardTitle>
                    <CardDescription>
                      Student's course completion progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ApexChart
                        type="line"
                        options={progressChartOptions}
                        series={progressChartSeries}
                        height="100%"
                        width="100%"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity Distribution</CardTitle>
                    <CardDescription>
                      Time spent on different activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ApexChart
                        type="pie"
                        options={activityChartOptions}
                        series={activityChartSeries}
                        height="100%"
                        width="100%"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="class" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classDetails.enrolledStudents}</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Active in this course
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classDetails.averageProgress}%</div>
                    <Progress value={classDetails.averageProgress} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Course completion rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classDetails.averageScore}%</div>
                    <Progress value={classDetails.averageScore} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Across all assessments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classDetails.completionRate}%</div>
                    <Progress value={classDetails.completionRate} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Students who completed the course
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Performance</CardTitle>
                    <CardDescription>
                      Class average scores and completion rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ApexChart
                        type="bar"
                        options={assessmentChartOptions}
                        series={assessmentChartSeries}
                        height="100%"
                        width="100%"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Completion Status</CardTitle>
                    <CardDescription>
                      Overall student progress status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ApexChart
                        type="donut"
                        options={completionChartOptions}
                        series={completionChartSeries}
                        height="100%"
                        width="100%"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                  <CardDescription>
                    Identified challenges based on class performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Most Challenging Content</h3>
                      <p className="text-sm text-muted-foreground">{classDetails.mostChallenging}</p>
                      <Progress value={45} className="h-2 mt-2" />
                    </div>

                    <div>
                      <h3 className="font-medium">Engagement Opportunities</h3>
                      <p className="text-sm text-muted-foreground">
                        25% of students haven't participated in discussion forums
                      </p>
                      <Progress value={75} className="h-2 mt-2" />
                    </div>

                    <div>
                      <h3 className="font-medium">At-Risk Students</h3>
                      <p className="text-sm text-muted-foreground">
                        5 students haven't logged in for more than 2 weeks
                      </p>
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
