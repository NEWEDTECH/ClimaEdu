'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'

// Mock data for tutors
const mockTutors = [
  { id: '1', name: 'João Silva', email: 'joao.silva@example.com', specialization: 'Web Development', joinDate: '2024-01-10', status: 'active' },
  { id: '2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', specialization: 'Data Science', joinDate: '2024-02-15', status: 'active' },
  { id: '3', name: 'Carlos Santos', email: 'carlos.santos@example.com', specialization: 'UX Design', joinDate: '2024-01-05', status: 'inactive' },
  { id: '4', name: 'Ana Costa', email: 'ana.costa@example.com', specialization: 'Mobile Development', joinDate: '2024-03-20', status: 'active' },
  { id: '5', name: 'Pedro Lima', email: 'pedro.lima@example.com', specialization: 'Artificial Intelligence', joinDate: '2024-02-28', status: 'active' },
]

export default function TutorPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Filter tutors based on search term and status
  const filteredTutors = mockTutors.filter(tutor => {
    const matchesSearch = 
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Tutor Management</h1>
            <Link href="/admin/tutor/create">
              <Button>Add New Tutor</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tutors</CardTitle>
              <CardDescription>
                Manage all tutors in your educational platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <InputText
                    type="text"
                    placeholder="Search by name, email or specialization..."
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
                      <th className="text-left py-3 px-4">Specialization</th>
                      <th className="text-left py-3 px-4">Join Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTutors.map((tutor) => (
                      <tr key={tutor.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="py-3 px-4">{tutor.name}</td>
                        <td className="py-3 px-4">{tutor.email}</td>
                        <td className="py-3 px-4">{tutor.specialization}</td>
                        <td className="py-3 px-4">{new Date(tutor.joinDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            tutor.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/tutor/edit/${tutor.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Link href={`/admin/tutor/link/${tutor.id}`}>
                              <Button variant="outline" size="sm">Link to Course</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredTutors.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No tutors found matching your search criteria.
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
