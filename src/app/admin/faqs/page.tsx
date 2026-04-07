'use client'

import { useState, useEffect } from 'react'
import { Editor } from 'primereact/editor'
import 'quill/dist/quill.snow.css'
import { FiChevronDown, FiChevronUp, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedContent } from '@/components/auth/ProtectedContent'
import { Button } from '@/components/button'
import { InputText } from '@/components/input'
import { SelectComponent } from '@/components/select/select'
import { LoadingSpinner } from '@/components/loader'
import { showToast } from '@/components/toast'
import { container, Register } from '@/_core/shared/container'
import { useProfile } from '@/context/zustand/useProfile'
import { UserRole } from '@/_core/modules/user/core/entities/User'
import { Institution } from '@/_core/modules/institution'
import type { FAQ } from '@/_core/modules/faq/core/entities/FAQ'
import { ListFaqsByInstitutionUseCase, ListFaqsByInstitutionInput } from '@/_core/modules/faq/core/use-cases/list-faqs-by-institution'
import { CreateFaqUseCase, CreateFaqInput } from '@/_core/modules/faq/core/use-cases/create-faq'
import { UpdateFaqUseCase, UpdateFaqInput } from '@/_core/modules/faq/core/use-cases/update-faq'
import { DeleteFaqUseCase, DeleteFaqInput } from '@/_core/modules/faq/core/use-cases/delete-faq'
import { ListInstitutionsUseCase } from '@/_core/modules/institution/core/use-cases/list-institutions/list-institutions.use-case'

type FormState = {
  title: string
  content: string
}

const EMPTY_FORM: FormState = { title: '', content: '' }

export default function FaqsPage() {
  const { infoUser } = useProfile()
  const isSystemAdmin = infoUser.currentRole === UserRole.SYSTEM_ADMIN || infoUser.currentRole === 'SUPER_ADMIN' as UserRole
  const isLocalAdmin = infoUser.currentRole === UserRole.LOCAL_ADMIN

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([])
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // Set institution for non-system-admin
  useEffect(() => {
    if (!infoUser.id) return

    if (isSystemAdmin) {
      const fetchInstitutions = async () => {
        try {
          const useCase = container.get<ListInstitutionsUseCase>(
            Register.institution.useCase.ListInstitutionsUseCase
          )
          const result = await useCase.execute({})
          const list = result.institutions.map((i: Institution) => ({ id: i.id, name: i.name }))
          setInstitutions(list)
          if (list.length > 0) setSelectedInstitutionId(list[0].id)
        } catch {
          showToast.error('Falha ao carregar instituições.')
        }
      }
      fetchInstitutions()
    } else if (infoUser.currentIdInstitution) {
      setSelectedInstitutionId(infoUser.currentIdInstitution)
    }
  }, [infoUser.id, infoUser.currentIdInstitution, isSystemAdmin])

  // Load FAQs when institution changes
  useEffect(() => {
    if (!selectedInstitutionId) return

    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const useCase = container.get<ListFaqsByInstitutionUseCase>(
          Register.faq.useCase.ListFaqsByInstitutionUseCase
        )
        const result = await useCase.execute(new ListFaqsByInstitutionInput(selectedInstitutionId))
        setFaqs(result.faqs)
      } catch {
        showToast.error('Falha ao carregar FAQs.')
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [selectedInstitutionId])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (faq: FAQ) => {
    setEditingId(faq.id)
    setForm({ title: faq.title, content: faq.content })
    setShowForm(true)
    setExpandedId(null)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast.error('Informe o título da FAQ.')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        const useCase = container.get<UpdateFaqUseCase>(Register.faq.useCase.UpdateFaqUseCase)
        const result = await useCase.execute(new UpdateFaqInput(editingId, form.title, form.content))
        setFaqs(prev => prev.map(f => f.id === editingId ? result.faq : f))
        showToast.success('FAQ atualizada.')
      } else {
        const useCase = container.get<CreateFaqUseCase>(Register.faq.useCase.CreateFaqUseCase)
        const result = await useCase.execute(new CreateFaqInput(selectedInstitutionId, form.title, form.content))
        setFaqs(prev => [result.faq, ...prev])
        showToast.success('FAQ criada.')
      }

      cancelForm()
    } catch {
      showToast.error('Erro ao salvar FAQ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (faq: FAQ) => {
    if (!confirm(`Excluir a FAQ "${faq.title}"?`)) return

    try {
      const useCase = container.get<DeleteFaqUseCase>(Register.faq.useCase.DeleteFaqUseCase)
      await useCase.execute(new DeleteFaqInput(faq.id))
      setFaqs(prev => prev.filter(f => f.id !== faq.id))
      showToast.success('FAQ excluída.')
    } catch {
      showToast.error('Erro ao excluir FAQ.')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6 max-w-3xl">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">FAQs</h1>
            {isLocalAdmin && !showForm && (
              <Button variant="primary" onClick={openCreate}>
                <FiPlus className="inline mr-1" />
                Criar FAQ
              </Button>
            )}
          </div>

          {/* Seletor de instituição para SYSTEM_ADMIN */}
          {isSystemAdmin && (
            <SelectComponent
              value={selectedInstitutionId}
              onChange={setSelectedInstitutionId}
              options={institutions.map(i => ({ value: i.id, label: i.name }))}
              placeholder="Selecione uma instituição"
            />
          )}

          {/* Formulário criar/editar */}
          {showForm && isLocalAdmin && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              <h2 className="font-semibold text-lg">
                {editingId ? 'Editar FAQ' : 'Nova FAQ'}
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <InputText
                  id="faq-title"
                  type="text"
                  placeholder="Digite o título da FAQ"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Resposta</label>
                <Editor
                  value={form.content}
                  onTextChange={e => setForm(prev => ({ ...prev, content: e.htmlValue ?? '' }))}
                  style={{ height: '220px' }}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" onClick={cancelForm} disabled={submitting}>
                  <FiX className="inline mr-1" />
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                  <FiCheck className="inline mr-1" />
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}

          {/* Lista de FAQs */}
          {loading ? (
            <LoadingSpinner />
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma FAQ encontrada.
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map(faq => (
                <div
                  key={faq.id}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800"
                >
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleExpand(faq.id)}
                  >
                    <span className="font-medium">{faq.title}</span>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {isLocalAdmin && (
                        <>
                          <span
                            role="button"
                            tabIndex={0}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={e => { e.stopPropagation(); openEdit(faq) }}
                            onKeyDown={e => e.key === 'Enter' && openEdit(faq)}
                          >
                            <FiEdit2 className="w-4 h-4 text-gray-500" />
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={e => { e.stopPropagation(); handleDelete(faq) }}
                            onKeyDown={e => e.key === 'Enter' && handleDelete(faq)}
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                          </span>
                        </>
                      )}
                      {expandedId === faq.id
                        ? <FiChevronUp className="w-5 h-5 text-gray-400" />
                        : <FiChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                  </button>

                  {expandedId === faq.id && (
                    <div
                      className="px-4 py-3 border-t text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: faq.content }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  )
}
