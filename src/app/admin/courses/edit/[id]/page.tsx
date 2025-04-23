'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'

// Define course data type
type CourseData = {
  id: string;
  name: string;
  description: string;
  instructor: string;
  duration: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
  price: string;
  category: string;
  level: string;
  enrolledStudents: number;
  status: string;
}

// Mock data for courses
const mockCourseData: Record<string, CourseData> = {
  '1': { 
    id: '1', 
    name: 'Web Development', 
    description: 'Learn HTML, CSS, and JavaScript to build modern web applications. This course covers frontend and backend development with practical projects.',
    instructor: 'João Silva', 
    duration: '12 weeks',
    startDate: '2025-05-15',
    endDate: '2025-08-07',
    maxStudents: '30',
    price: '1200.00',
    category: 'Programming',
    level: 'beginner',
    enrolledStudents: 28,
    status: 'active'
  },
  '2': { 
    id: '2', 
    name: 'Data Science', 
    description: 'Introduction to data analysis and visualization using Python, pandas, and matplotlib. Learn statistical methods and machine learning basics.',
    instructor: 'Maria Oliveira', 
    duration: '10 weeks',
    startDate: '2025-06-01',
    endDate: '2025-08-10',
    maxStudents: '40',
    price: '1500.00',
    category: 'Data',
    level: 'intermediate',
    enrolledStudents: 35,
    status: 'active'
  },
  '3': { 
    id: '3', 
    name: 'UX Design', 
    description: 'User experience principles and practices for creating intuitive digital products. Includes user research, wireframing, and prototyping.',
    instructor: 'Carlos Santos', 
    duration: '8 weeks',
    startDate: '2025-04-10',
    endDate: '2025-06-05',
    maxStudents: '25',
    price: '950.00',
    category: 'Design',
    level: 'beginner',
    enrolledStudents: 22,
    status: 'inactive'
  },
  '4': { 
    id: '4', 
    name: 'Mobile Development', 
    description: 'Build native mobile applications for iOS and Android using React Native. Create cross-platform apps with a single codebase.',
    instructor: 'Ana Costa', 
    duration: '14 weeks',
    startDate: '2025-07-01',
    endDate: '2025-10-07',
    maxStudents: '20',
    price: '1800.00',
    category: 'Programming',
    level: 'intermediate',
    enrolledStudents: 18,
    status: 'active'
  },
  '5': { 
    id: '5', 
    name: 'Artificial Intelligence', 
    description: 'Introduction to AI and machine learning concepts and applications. Covers neural networks, deep learning, and natural language processing.',
    instructor: 'Pedro Lima', 
    duration: '16 weeks',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    maxStudents: '35',
    price: '2200.00',
    category: 'Data',
    level: 'advanced',
    enrolledStudents: 30,
    status: 'active'
  },
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [formData, setFormData] = useState<CourseData>({
    id: '',
    name: '',
    description: '',
    instructor: '',
    duration: '',
    startDate: '',
    endDate: '',
    maxStudents: '',
    price: '',
    category: '',
    level: 'beginner',
    enrolledStudents: 0,
    status: 'active'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, this would be an API call to fetch the course data
    const fetchCourseData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if course exists in our mock data
        if (mockCourseData[id]) {
          setFormData(mockCourseData[id])
          setIsLoading(false)
        } else {
          setError('Course not found')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching course data:', error)
        setError('Failed to load course data')
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to update the course
      console.log('Updating course:', formData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to course list page after successful update
      router.push('/admin/courses')
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <p>Loading course data...</p>
          </div>
        </DashboardLayout>
      </ProtectedContent>
    )
  }

  if (error) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="mb-4">{error}</p>
                <Link href="/admin/courses">
                  <Button>Return to Course List</Button>
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
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <Link href="/admin/courses">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Update the details of {formData.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Course Name
                    </label>
                    <InputText
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter course name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="instructor" className="text-sm font-medium">
                      Instructor
                    </label>
                    <InputText
                      id="instructor"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      placeholder="Enter instructor name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <InputText
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Enter course category"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="level" className="text-sm font-medium">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">
                      Duration
                    </label>
                    <InputText
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 12 weeks"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="maxStudents" className="text-sm font-medium">
                      Maximum Students
                    </label>
                    <InputText
                      id="maxStudents"
                      name="maxStudents"
                      type="number"
                      value={formData.maxStudents}
                      onChange={handleChange}
                      placeholder="Enter maximum number of students"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Start Date
                    </label>
                    <InputText
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                    </label>
                    <InputText
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price
                    </label>
                    <InputText
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter course price"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter course description"
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                    required
                  />
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Enrollment Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently enrolled students: <span className="font-semibold">{formData.enrolledStudents}</span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/courses">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
