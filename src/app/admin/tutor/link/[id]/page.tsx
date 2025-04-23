'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'

// Define tutor data type
type TutorData = {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

// Define course data type
type CourseData = {
  id: string;
  name: string;
  description: string;
  duration: string;
  isAssigned?: boolean;
}

// Mock data for a tutor
const mockTutorData: Record<string, TutorData> = {
  '1': { id: '1', name: 'João Silva', email: 'joao.silva@example.com', specialization: 'Web Development' },
  '2': { id: '2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', specialization: 'Data Science' },
  '3': { id: '3', name: 'Carlos Santos', email: 'carlos.santos@example.com', specialization: 'UX Design' },
  '4': { id: '4', name: 'Ana Costa', email: 'ana.costa@example.com', specialization: 'Mobile Development' },
  '5': { id: '5', name: 'Pedro Lima', email: 'pedro.lima@example.com', specialization: 'Artificial Intelligence' },
}

// Mock data for courses
const mockCourses: CourseData[] = [
  { id: '1', name: 'Web Development', description: 'Learn HTML, CSS, and JavaScript', duration: '12 weeks' },
  { id: '2', name: 'Data Science', description: 'Introduction to data analysis and visualization', duration: '10 weeks' },
  { id: '3', name: 'UX Design', description: 'User experience principles and practices', duration: '8 weeks' },
  { id: '4', name: 'Mobile Development', description: 'Build native mobile applications', duration: '14 weeks' },
  { id: '5', name: 'Artificial Intelligence', description: 'Introduction to AI and machine learning', duration: '16 weeks' },
]

// Mock data for tutor assignments
const mockAssignments: Record<string, string[]> = {
  '1': ['1'], // Tutor 1 is assigned to course 1
  '2': ['2'], // Tutor 2 is assigned to course 2
  '3': ['3'], // Tutor 3 is assigned to course 3
  '4': ['4'], // Tutor 4 is assigned to course 4
  '5': ['5'], // Tutor 5 is assigned to course 5
}

export default function LinkTutorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [tutor, setTutor] = useState<TutorData | null>(null)
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([])
  const [assignedCourses, setAssignedCourses] = useState<CourseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('available')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // In a real application, this would be an API call to fetch the tutor and course data
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if tutor exists in our mock data
        if (mockTutorData[id]) {
          setTutor(mockTutorData[id])
          
          // Get tutor assignments
          const tutorAssignmentIds = mockAssignments[id] || []
          
          // Filter courses into assigned and available
          const assigned = mockCourses.filter(course => 
            tutorAssignmentIds.includes(course.id)
          )
          
          const available = mockCourses.filter(course => 
            !tutorAssignmentIds.includes(course.id)
          )
          
          setAssignedCourses(assigned)
          setAvailableCourses(available)
          setIsLoading(false)
        } else {
          setError('Tutor not found')
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

  const handleAssign = async (courseId: string) => {
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to assign the tutor
      console.log(`Assigning tutor ${id} to course ${courseId}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state to reflect the assignment
      const courseToAssign = availableCourses.find(course => course.id === courseId)
      
      if (courseToAssign) {
        setAssignedCourses(prev => [...prev, courseToAssign])
        setAvailableCourses(prev => prev.filter(course => course.id !== courseId))
      }
      
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error assigning tutor:', error)
      setIsSubmitting(false)
    }
  }

  const handleUnassign = async (courseId: string) => {
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to unassign the tutor
      console.log(`Unassigning tutor ${id} from course ${courseId}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state to reflect the unassignment
      const courseToUnassign = assignedCourses.find(course => course.id === courseId)
      
      if (courseToUnassign) {
        setAvailableCourses(prev => [...prev, courseToUnassign])
        setAssignedCourses(prev => prev.filter(course => course.id !== courseId))
      }
      
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error unassigning tutor:', error)
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

  if (error || !tutor) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="mb-4">{error || 'Tutor not found'}</p>
                <Link href="/admin/tutor">
                  <Button>Return to Tutor List</Button>
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
            <h1 className="text-3xl font-bold">Manage Course Assignments</h1>
            <Link href="/admin/tutor">
              <Button variant="outline">Back to Tutors</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tutor: {tutor.name}</CardTitle>
              <CardDescription>
                Email: {tutor.email} | Specialization: {tutor.specialization}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="assigned">
                    Assigned Courses ({assignedCourses.length})
                  </TabsTrigger>
                  <TabsTrigger value="available">
                    Available Courses ({availableCourses.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="assigned" className="mt-6">
                  {assignedCourses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      This tutor is not assigned to any courses yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedCourses.map(course => (
                        <Card key={course.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="text-sm">
                              <p><span className="font-medium">Duration:</span> {course.duration}</p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              onClick={() => handleUnassign(course.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Processing...' : 'Unassign'}
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
                      No more courses available for assignment.
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
                            <div className="text-sm">
                              <p><span className="font-medium">Duration:</span> {course.duration}</p>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full" 
                              onClick={() => handleAssign(course.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? 'Processing...' : 'Assign'}
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
