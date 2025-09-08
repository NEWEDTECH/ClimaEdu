'use client';

import React from 'react';
import { InputText } from '@/components/ui/input/input-text/InputText';

interface NumericInputProps {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (value: number) => void;
  defaultValue?: number;
  onReset?: () => void;
  error?: string;
  placeholder?: string;
}

export function NumericInput({
  label,
  description,
  value,
  min,
  max,
  unit = '',
  onChange,
  defaultValue,
  onReset,
  error,
  placeholder
}: NumericInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        {defaultValue !== undefined && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            title={`Reset to default (${defaultValue}${unit})`}
          >
            Reset
          </button>
        )}
      </div>
      
      <div className="relative">
        <InputText
          type="number"
          value={value.toString()}
          onChange={handleChange}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`${error ? 'border-red-500' : ''} ${unit ? 'pr-12' : ''}`}
          aria-invalid={!!error}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{unit}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      {min !== undefined && max !== undefined && (
        <p className="text-xs text-gray-500">
          Range: {min} - {max}{unit}
        </p>
      )}
    </div>
  );
}