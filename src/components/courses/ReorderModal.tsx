'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/button'
import { SelectComponent } from '@/components/select'
import { X, GripVertical, BookOpen, FileText, Layers } from 'lucide-react'
import { container, Register } from '@/_core/shared/container'
import { ModuleRepository } from '@/_core/modules/content/infrastructure/repositories/ModuleRepository'
import { LessonRepository } from '@/_core/modules/content/infrastructure/repositories/LessonRepository'
import { ContentRepository } from '@/_core/modules/content/infrastructure/repositories/ContentRepository'
import { showToast } from '@/components/toast'

type ReorderType = 'modules' | 'lessons' | 'actions'

type ModuleItem = {
  id: string
  title: string
  order: number
}

type LessonItem = {
  id: string
  title: string
  order: number
}

type ActionItem = {
  id: string
  title: string
  type: string
  order: number
}

type ReorderModalProps = {
  isOpen: boolean
  onClose: () => void
  courseId: string
  onSuccess?: () => void
}

export function ReorderModal({ isOpen, onClose, courseId, onSuccess }: ReorderModalProps) {
  const [reorderType, setReorderType] = useState<ReorderType>('modules')
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load modules
  useEffect(() => {
    if (!isOpen || !courseId) return
    
    const loadModules = async () => {
      setLoading(true)
      try {
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )
        const modulesList = await moduleRepository.listByCourse(courseId)
        
        const modulesData = modulesList
          .map(m => ({
            id: m.id,
            title: m.title,
            order: m.order
          }))
          .sort((a, b) => a.order - b.order)
        
        setModules(modulesData)
      } catch (error) {
        console.error('Error loading modules:', error)
        showToast.error('Erro ao carregar módulos')
      } finally {
        setLoading(false)
      }
    }
    
    loadModules()
  }, [isOpen, courseId])

  // Load lessons when module is selected (for both lessons and actions mode)
  useEffect(() => {
    if (!selectedModuleId) return
    if (reorderType !== 'lessons' && reorderType !== 'actions') return
    
    const loadLessons = async () => {
      setLoading(true)
      try {
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )
        const lessonsList = await lessonRepository.listByModule(selectedModuleId)
        
        const lessonsData = lessonsList
          .map(l => ({
            id: l.id,
            title: l.title,
            order: l.order
          }))
          .sort((a, b) => a.order - b.order)
        
        setLessons(lessonsData)
      } catch (error) {
        console.error('Error loading lessons:', error)
        showToast.error('Erro ao carregar lições')
      } finally {
        setLoading(false)
      }
    }
    
    loadLessons()
  }, [selectedModuleId, reorderType])

  // Load actions when lesson is selected
  useEffect(() => {
    if (!selectedLessonId || reorderType !== 'actions') return
    
    const loadActions = async () => {
      setLoading(true)
      try {
        const contentRepository = container.get<ContentRepository>(
          Register.content.repository.ContentRepository
        )
        const actionsList = await contentRepository.listByLesson(selectedLessonId)
        
        const actionsData = actionsList
          .map(a => ({
            id: a.id,
            title: a.title,
            type: a.type,
            order: a.order
          }))
          .sort((a, b) => a.order - b.order)
        
        setActions(actionsData)
      } catch (error) {
        console.error('Error loading actions:', error)
        showToast.error('Erro ao carregar ações')
      } finally {
        setLoading(false)
      }
    }
    
    loadActions()
  }, [selectedLessonId, reorderType])

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    if (reorderType === 'modules') {
      const items = Array.from(modules)
      const [reorderedItem] = items.splice(sourceIndex, 1)
      items.splice(destinationIndex, 0, reorderedItem)
      
      // Update order values
      const updatedItems = items.map((item, index) => ({
        ...item,
        order: index
      }))
      
      setModules(updatedItems)
    } else if (reorderType === 'lessons') {
      const items = Array.from(lessons)
      const [reorderedItem] = items.splice(sourceIndex, 1)
      items.splice(destinationIndex, 0, reorderedItem)
      
      const updatedItems = items.map((item, index) => ({
        ...item,
        order: index
      }))
      
      setLessons(updatedItems)
    } else if (reorderType === 'actions') {
      const items = Array.from(actions)
      const [reorderedItem] = items.splice(sourceIndex, 1)
      items.splice(destinationIndex, 0, reorderedItem)
      
      const updatedItems = items.map((item, index) => ({
        ...item,
        order: index
      }))
      
      setActions(updatedItems)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const loadingToastId = showToast.loading('Salvando ordem...')

    try {
      if (reorderType === 'modules') {
        const moduleRepository = container.get<ModuleRepository>(
          Register.content.repository.ModuleRepository
        )
        
        for (const module of modules) {
          const moduleEntity = await moduleRepository.findById(module.id)
          if (moduleEntity) {
            // Update order through repository
            await moduleRepository.updateOrder(module.id, module.order)
          }
        }
      } else if (reorderType === 'lessons') {
        const lessonRepository = container.get<LessonRepository>(
          Register.content.repository.LessonRepository
        )
        
        for (const lesson of lessons) {
          const lessonEntity = await lessonRepository.findById(lesson.id)
          if (lessonEntity) {
            await lessonRepository.updateOrder(lesson.id, lesson.order)
          }
        }
      } else if (reorderType === 'actions') {
        const contentRepository = container.get<ContentRepository>(
          Register.content.repository.ContentRepository
        )
        
        for (const action of actions) {
          const actionEntity = await contentRepository.findById(action.id)
          if (actionEntity) {
            await contentRepository.updateOrder(action.id, action.order)
          }
        }
      }

      showToast.update(loadingToastId, {
        render: 'Ordem atualizada com sucesso!',
        type: 'success'
      })

      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving order:', error)
      showToast.update(loadingToastId, {
        render: 'Erro ao salvar ordem',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTypeChange = (type: ReorderType) => {
    setReorderType(type)
    setSelectedModuleId('')
    setSelectedLessonId('')
    setLessons([])
    setActions([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reordenar Conteúdo</CardTitle>
              <CardDescription>Arraste e solte para reorganizar a ordem</CardDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleTypeChange('modules')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reorderType === 'modules'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <Layers className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Módulos</p>
            </button>
            <button
              onClick={() => handleTypeChange('lessons')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reorderType === 'lessons'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Lições</p>
            </button>
            <button
              onClick={() => handleTypeChange('actions')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reorderType === 'actions'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Ações</p>
            </button>
          </div>

          {/* Lessons: Module Selection */}
          {reorderType === 'lessons' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Selecione o Módulo</label>
              <SelectComponent
                value={selectedModuleId}
                onChange={setSelectedModuleId}
                options={modules.map(m => ({ value: m.id, label: m.title }))}
                placeholder="Selecione um módulo"
              />
            </div>
          )}

          {/* Actions: Module and Lesson Selection */}
          {reorderType === 'actions' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Selecione o Módulo</label>
                <SelectComponent
                  value={selectedModuleId}
                  onChange={(value) => {
                    setSelectedModuleId(value)
                    setSelectedLessonId('')
                    setActions([])
                  }}
                  options={modules.map(m => ({ value: m.id, label: m.title }))}
                  placeholder="Selecione um módulo"
                />
              </div>
              {selectedModuleId && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecione a Lição</label>
                  <SelectComponent
                    value={selectedLessonId}
                    onChange={setSelectedLessonId}
                    options={lessons.map(l => ({ value: l.id, label: l.title }))}
                    placeholder="Selecione uma lição"
                  />
                </div>
              )}
            </div>
          )}

          {/* Drag and Drop List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {reorderType === 'modules' && modules.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="modules">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {modules.map((module, index) => (
                          <Draggable key={module.id} draggableId={module.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                  snapshot.isDragging
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                              >
                                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{module.title}</p>
                                  <p className="text-xs text-gray-500">Ordem: {index + 1}</p>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {reorderType === 'lessons' && selectedModuleId && lessons.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="lessons">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {lessons.map((lesson, index) => (
                          <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                  snapshot.isDragging
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                              >
                                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{lesson.title}</p>
                                  <p className="text-xs text-gray-500">Ordem: {index + 1}</p>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {reorderType === 'actions' && selectedLessonId && actions.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="actions">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {actions.map((action, index) => (
                          <Draggable key={action.id} draggableId={action.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                                  snapshot.isDragging
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                              >
                                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{action.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                                      {action.type}
                                    </span>
                                    <span className="text-xs text-gray-500">Ordem: {index + 1}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {/* Empty States */}
              {reorderType === 'lessons' && !selectedModuleId && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Selecione um módulo para ver as lições</p>
                </div>
              )}

              {reorderType === 'lessons' && selectedModuleId && lessons.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Este módulo não possui lições</p>
                </div>
              )}

              {reorderType === 'actions' && !selectedModuleId && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Selecione um módulo primeiro</p>
                </div>
              )}

              {reorderType === 'actions' && selectedModuleId && !selectedLessonId && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Selecione uma lição para ver as ações</p>
                </div>
              )}

              {reorderType === 'actions' && selectedLessonId && actions.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Esta lição não possui ações</p>
                </div>
              )}
            </>
          )}
        </CardContent>

        <div className="border-t p-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || loading || (reorderType === 'modules' && modules.length === 0) || (reorderType === 'lessons' && lessons.length === 0) || (reorderType === 'actions' && actions.length === 0)}
          >
            {saving ? 'Salvando...' : 'Salvar Ordem'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
