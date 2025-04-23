'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'

// Define student data type
type StudentData = {
  id: string;
  name: string;
  email: string;
}

// Define course data type
type CourseData = {
  id: string;
  name: string;
  description: string;
  instructor: string;
  duration: string;
  isEnrolled?: boolean;
}

// Mock data for a student
const mockStudentData: Record<string, StudentData> = {
  '1': { id: '1', name: 'Ana Silva', email: 'ana.silva@example.com' },
  '2': { id: '2', name: 'Carlos Oliveira', email: 'carlos.oliveira@example.com' },
  '3': { id: '3', name: 'Mariana Santos', email: 'mariana.santos@example.com' },
  '4': { id: '4', name: 'Pedro Costa', email: 'pedro.costa@example.com' },
  '5': { id: '5', name: 'Juliana Lima', email: 'juliana.lima@example.com' },
}

// Mock data for courses
const mockCourses: CourseData[] = [
  { id: '1', name: 'Web Development', description: 'Learn HTML, CSS, and JavaScript', instructor: 'João Silva', duration: '12 weeks' },
  { id: '2', name: 'Data Science', description: 'Introduction to data analysis and visualization', instructor: 'Maria Oliveira', duration: '10 weeks' },
  { id: '3', name: 'UX Design', description: 'User experience principles and practices', instructor: 'Carlos Santos', duration: '8 weeks' },
  { id: '4', name: 'Mobile Development', description: 'Build native mobile applications', instructor: 'Ana Costa', duration: '14 weeks' },
  { id: '5', name: 'Artificial Intelligence', description: 'Introduction to AI and machine learning', instructor: 'Pedro Lima', duration: '16 weeks' },
]

// Mock data for student enrollments
const mockEnrollments: Record<string, string[]> = {
  '1': ['1', '3'], // Student 1 is enrolled in courses 1 and 3
  '2': ['2', '5'], // Student 2 is enrolled in courses 2 and 5
  '3': ['3'],      // Student 3 is enrolled in course 3
  '4': ['1', '4'], // Student 4 is enrolled in courses 1 and 4
  '5': ['5'],      // Student 5 is enrolled in course 5
}

export default function LinkStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [student, setStudent] = useState<StudentData | null>(null)
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<CourseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('available')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // In a real application, this would be an API call to fetch the student and course data
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if student exists in our mock data
        if (mockStudentData[id]) {
          setStudent(mockStudentData[id])
          
          // Get student enrollments
          const studentEnrollmentIds = mockEnrollments[id] || []
          
          // Filter courses into enrolled and available
          const enrolled = mockCourses.filter(course => 
            studentEnrollmentIds.includes(course.id)
          )
          
          const available = mockCourses.filter(course => 
            !studentEnrollmentIds.includes(course.id)
          )
          
          setEnrolledCourses(enrolled)
          setAvailableCourses(available)
          setIsLoading(false)
        } else {
          setError('Student not found')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleEnroll = async (courseId: string) => {
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to enroll the student
      console.log(`Enrolling student ${id} in course ${courseId}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state to reflect the enrollment
      const courseToEnroll = availableCourses.find(course => course.id === courseId)
      
      if (courseToEnroll) {
        setEnrolledCourses(prev => [...prev, courseToEnroll])
        setAvailableCourses(prev => prev.filter(course => course.id !== courseId))
      }
      
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error enrolling student:', error)
      setIsSubmitting(false)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to unenroll the student
      console.log(`Unenrolling student ${id} from course ${courseId}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state to reflect the unenrollment
      const courseToUnenroll = enrolledCourses.find(course => course.id === courseId)
      
      if (courseToUnenroll) {
        setAvailableCourses(prev => [...prev, courseToUnenroll])
        setEnrolledCourses(prev => prev.filter(course => course.id !== courseId))
      }
      
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error unenrolling student:', error)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <p>Loading data...</p>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (error || !student) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="mb-4">{error || 'Student not found'}</p>
                <Link href="/admin/student">
                  <Button>Return to Student List</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Manage Course Enrollments</h1>
            <Link href="/admin/student">
              <Button variant="outline">Back to Students</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student: {student.name}</CardTitle>
              <CardDescription>
                Email: {student.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="enrolled">
                    Enrolled Courses ({enrolledCourses.length})
                  </TabsTrigger>
                  <TabsTrigger value="available">
                    Available Courses ({availableCourses.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="enrolled" className="mt-6">
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      This student is not enrolled in any courses yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enrolledCourses.map(course => (
                        <Card key={course.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Instructor:</span> {course.instructor}</p>
                              <p><span className="font-medium">Duration:</span> {course.duration}</p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              onClick={() => handleUnenroll(course.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Processing...' : 'Unenroll'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="available" className="mt-6">
                  {availableCourses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No more courses available for enrollment.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableCourses.map(course => (
                        <Card key={course.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Instructor:</span> {course.instructor}</p>
                              <p><span className="font-medium">Duration:</span> {course.duration}</p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full" 
                              onClick={() => handleEnroll(course.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Processing...' : 'Enroll'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
