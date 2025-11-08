'use client';

import { InputText } from '@/components/input';
import { SelectComponent } from '@/components/select';
import { ImageUpload } from '@/components/upload';

export type CourseFormData = {
  title: string;
  description: string;
  institutionId: string;
  coverImageUrl: string;
};

type CourseFormFieldsProps = {
  formData: CourseFormData;
  institutions: Array<{ id: string; name: string }>;
  onFieldChange: (field: keyof CourseFormData, value: string) => void;
  showInstitutionSelect?: boolean;
  onImageUpload: (url: string) => void;
};

export function CourseFormFields({
  formData,
  institutions,
  onFieldChange,
  showInstitutionSelect = true,
  onImageUpload,
}: CourseFormFieldsProps) {
  return (
    <div className="space-y-6">
      {showInstitutionSelect && (
        <div className="space-y-2">
          <label htmlFor="institutionId" className="text-sm font-medium">
            Instituição *
          </label>
          <SelectComponent
            value={formData.institutionId}
            onChange={(value) => onFieldChange('institutionId', value)}
            options={institutions.map((institution) => ({
              value: institution.id,
              label: institution.name,
            }))}
            placeholder="Selecione uma instituição"
            className="w-full"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Título do Curso *
        </label>
        <InputText
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          placeholder="Adicione um título ao curso"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Adicione uma descrição"
          required
          rows={4}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        />
      </div>

      {formData.institutionId && (
        <>
          <ImageUpload
            imageType="course"
            institutionId={formData.institutionId}
            onUploadSuccess={onImageUpload}
            currentImageUrl={formData.coverImageUrl}
            label="Imagem de Capa do Curso"
            required
          />
          {formData.coverImageUrl && (
            <p className="text-sm text-green-600">✓ Imagem de capa definida</p>
          )}
        </>
      )}
    </div>
  );
}
