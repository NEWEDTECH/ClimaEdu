'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'

// Mock data for courses
const mockCourses = [
  { 
    id: '1', 
    name: 'Web Development', 
    description: 'Learn HTML, CSS, and JavaScript', 
    instructor: 'João Silva', 
    duration: '12 weeks',
    enrolledStudents: 28,
    status: 'active'
  },
  { 
    id: '2', 
    name: 'Data Science', 
    description: 'Introduction to data analysis and visualization', 
    instructor: 'Maria Oliveira', 
    duration: '10 weeks',
    enrolledStudents: 35,
    status: 'active'
  },
  { 
    id: '3', 
    name: 'UX Design', 
    description: 'User experience principles and practices', 
    instructor: 'Carlos Santos', 
    duration: '8 weeks',
    enrolledStudents: 22,
    status: 'inactive'
  },
  { 
    id: '4', 
    name: 'Mobile Development', 
    description: 'Build native mobile applications', 
    instructor: 'Ana Costa', 
    duration: '14 weeks',
    enrolledStudents: 18,
    status: 'active'
  },
  { 
    id: '5', 
    name: 'Artificial Intelligence', 
    description: 'Introduction to AI and machine learning', 
    instructor: 'Pedro Lima', 
    duration: '16 weeks',
    enrolledStudents: 30,
    status: 'active'
  },
]

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Filter courses based on search term and status
  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Course Management</h1>
            <Link href="/admin/courses/create">
              <Button>Add New Course</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage all courses in your educational platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    type="text"
                    placeholder="Search by name, description or instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Instructor</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Students</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="py-3 px-4">{course.name}</td>
                        <td className="py-3 px-4 max-w-xs truncate">{course.description}</td>
                        <td className="py-3 px-4">{course.instructor}</td>
                        <td className="py-3 px-4">{course.duration}</td>
                        <td className="py-3 px-4">{course.enrolledStudents}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            course.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/courses/edit/${course.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCourses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No courses found matching your search criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
