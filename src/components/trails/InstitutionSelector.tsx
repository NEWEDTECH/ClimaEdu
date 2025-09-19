'use client'

import { SelectComponent } from '@/components/select'

interface InstitutionSelectorProps {
  institutions: Array<{ id: string, name: string }>
  selectedInstitutionId: string
  onInstitutionChange: (institutionId: string) => void
  disabled?: boolean
}

export function InstitutionSelector({
  institutions,
  selectedInstitutionId,
  onInstitutionChange,
  disabled = false
}: InstitutionSelectorProps) {
  return (
    <div>
      <label htmlFor="institution" className="block text-sm font-medium mb-2">
        Instituição *
      </label>
      <SelectComponent
        value={selectedInstitutionId}
        onChange={onInstitutionChange}
        options={institutions.map(institution => ({
          value: institution.id,
          label: institution.name
        }))}
        placeholder="Selecione uma instituição"
      />
    </div>
  )
}
