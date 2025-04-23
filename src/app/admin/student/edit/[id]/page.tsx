'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'

// Define student data type
type StudentData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  documentId: string;
}

// Mock data for a student
const mockStudentData: Record<string, StudentData> = {
  '1': { id: '1', name: 'Ana Silva', email: 'ana.silva@example.com', phone: '(11) 98765-4321', address: 'Rua das Flores, 123', birthDate: '1998-05-15', documentId: '123.456.789-00' },
  '2': { id: '2', name: 'Carlos Oliveira', email: 'carlos.oliveira@example.com', phone: '(21) 98765-4321', address: 'Av. Principal, 456', birthDate: '1995-10-20', documentId: '987.654.321-00' },
  '3': { id: '3', name: 'Mariana Santos', email: 'mariana.santos@example.com', phone: '(31) 98765-4321', address: 'Rua do Comércio, 789', birthDate: '1997-03-25', documentId: '456.789.123-00' },
  '4': { id: '4', name: 'Pedro Costa', email: 'pedro.costa@example.com', phone: '(41) 98765-4321', address: 'Av. Central, 321', birthDate: '1996-07-10', documentId: '789.123.456-00' },
  '5': { id: '5', name: 'Juliana Lima', email: 'juliana.lima@example.com', phone: '(51) 98765-4321', address: 'Rua das Palmeiras, 654', birthDate: '1999-12-05', documentId: '321.654.987-00' },
}

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    documentId: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, this would be an API call to fetch the student data
    const fetchStudentData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if student exists in our mock data
        if (mockStudentData[id]) {
          setFormData(mockStudentData[id])
          setIsLoading(false)
        } else {
          setError('Student not found')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching student data:', error)
        setError('Failed to load student data')
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to update the student
      console.log('Updating student:', formData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to student list page after successful update
      router.push('/admin/student')
    } catch (error) {
      console.error('Error updating student:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <p>Loading student data...</p>
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
            <h1 className="text-3xl font-bold">Edit Student</h1>
            <Link href="/admin/student">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>
                  Update the details of {formData.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <InputText
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <InputText
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <InputText
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="documentId" className="text-sm font-medium">
                      Document ID
                    </label>
                    <InputText
                      id="documentId"
                      name="documentId"
                      value={formData.documentId}
                      onChange={handleChange}
                      placeholder="Enter ID document number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="birthDate" className="text-sm font-medium">
                      Birth Date
                    </label>
                    <InputText
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Address
                    </label>
                    <InputText
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/student">
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
