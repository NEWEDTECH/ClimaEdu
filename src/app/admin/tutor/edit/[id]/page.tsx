'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button/button'
import { InputText } from '@/components/ui/input/input-text/InputText'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'

// Define tutor data type
type TutorData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  education: string;
  documentId: string;
}

// Mock data for tutors
const mockTutorData: Record<string, TutorData> = {
  '1': { 
    id: '1', 
    name: 'João Silva', 
    email: 'joao.silva@example.com', 
    phone: '(11) 98765-4321', 
    specialization: 'Web Development',
    bio: 'Experienced web developer with 10+ years of experience in frontend and backend technologies.',
    education: 'Master in Computer Science',
    documentId: '123.456.789-00'
  },
  '2': { 
    id: '2', 
    name: 'Maria Oliveira', 
    email: 'maria.oliveira@example.com', 
    phone: '(21) 98765-4321', 
    specialization: 'Data Science',
    bio: 'Data scientist with expertise in machine learning and statistical analysis.',
    education: 'PhD in Statistics',
    documentId: '987.654.321-00'
  },
  '3': { 
    id: '3', 
    name: 'Carlos Santos', 
    email: 'carlos.santos@example.com', 
    phone: '(31) 98765-4321', 
    specialization: 'UX Design',
    bio: 'UX designer focused on creating intuitive and accessible user interfaces.',
    education: 'Bachelor in Design',
    documentId: '456.789.123-00'
  },
  '4': { 
    id: '4', 
    name: 'Ana Costa', 
    email: 'ana.costa@example.com', 
    phone: '(41) 98765-4321', 
    specialization: 'Mobile Development',
    bio: 'Mobile app developer with experience in iOS and Android platforms.',
    education: 'Master in Software Engineering',
    documentId: '789.123.456-00'
  },
  '5': { 
    id: '5', 
    name: 'Pedro Lima', 
    email: 'pedro.lima@example.com', 
    phone: '(51) 98765-4321', 
    specialization: 'Artificial Intelligence',
    bio: 'AI researcher with focus on natural language processing and computer vision.',
    education: 'PhD in Computer Science',
    documentId: '321.654.987-00'
  },
}

export default function EditTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  const resolvedParams = 'then' in params ? use(params) : params
  const { id } = resolvedParams
  
  const [formData, setFormData] = useState<TutorData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    education: '',
    documentId: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real application, this would be an API call to fetch the tutor data
    const fetchTutorData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if tutor exists in our mock data
        if (mockTutorData[id]) {
          setFormData(mockTutorData[id])
          setIsLoading(false)
        } else {
          setError('Tutor not found')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching tutor data:', error)
        setError('Failed to load tutor data')
        setIsLoading(false)
      }
    }

    fetchTutorData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // In a real application, this would be an API call to update the tutor
      console.log('Updating tutor:', formData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to tutor list page after successful update
      router.push('/admin/tutor')
    } catch (error) {
      console.error('Error updating tutor:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedContent>
        <DashboardLayout>
          <div className="container mx-auto p-6 flex justify-center items-center">
            <p>Loading tutor data...</p>
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
            <h1 className="text-3xl font-bold">Edit Tutor</h1>
            <Link href="/admin/tutor">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Tutor Information</CardTitle>
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
                    <label htmlFor="specialization" className="text-sm font-medium">
                      Specialization
                    </label>
                    <InputText
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="Enter area of specialization"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="education" className="text-sm font-medium">
                      Education
                    </label>
                    <InputText
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="Enter highest education level"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Biography
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Enter a short biography"
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href="/admin/tutor">
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
