'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'

// Mock data for students
const mockStudents = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@example.com', course: 'Web Development', enrollmentDate: '2025-01-15', status: 'active' },
  { id: '2', name: 'Carlos Oliveira', email: 'carlos.oliveira@example.com', course: 'Data Science', enrollmentDate: '2025-02-10', status: 'active' },
  { id: '3', name: 'Mariana Santos', email: 'mariana.santos@example.com', course: 'UX Design', enrollmentDate: '2025-01-20', status: 'inactive' },
  { id: '4', name: 'Pedro Costa', email: 'pedro.costa@example.com', course: 'Mobile Development', enrollmentDate: '2025-03-05', status: 'active' },
  { id: '5', name: 'Juliana Lima', email: 'juliana.lima@example.com', course: 'Artificial Intelligence', enrollmentDate: '2025-02-25', status: 'active' },
]

export default function StudentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Filter students based on search term and status
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Student Management</h1>
            <Link href="/admin/student/create">
              <Button>Add New Student</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage all students enrolled in your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    type="text"
                    placeholder="Search by name, email or course..."
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
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-left py-3 px-4">Enrollment Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="py-3 px-4">{student.name}</td>
                        <td className="py-3 px-4">{student.email}</td>
                        <td className="py-3 px-4">{student.course}</td>
                        <td className="py-3 px-4">{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/student/edit/${student.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Link href={`/admin/student/link/${student.id}`}>
                              <Button variant="outline" size="sm">Link to Course</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No students found matching your search criteria.
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
