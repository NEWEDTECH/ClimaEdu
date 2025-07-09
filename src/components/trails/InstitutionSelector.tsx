'use client'

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
      <select
        id="institution"
        value={selectedInstitutionId}
        onChange={(e) => onInstitutionChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:opacity-50 disabled:cursor-not-allowed"
        required
      >
        <option value="">Selecione uma instituição</option>
        {institutions.map(institution => (
          <option key={institution.id} value={institution.id}>
            {institution.name}
          </option>
        ))}
      </select>
    </div>
  )
}
