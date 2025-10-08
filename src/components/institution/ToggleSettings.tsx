'use client';

import React from 'react';
import { Button } from '@/components/button'

interface ToggleSettingsProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  defaultValue?: boolean;
  onReset?: () => void;
}

export function ToggleSettings({
  label,
  description,
  enabled,
  onChange,
  defaultValue,
  onReset
}: ToggleSettingsProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="flex items-center gap-2">
            {defaultValue !== undefined && onReset && (
              <Button
                type="button"
                onClick={onReset}
                className="text-xs hover:text-blue-800"
                title={`Reset to default (${defaultValue ? 'Enabled' : 'Disabled'})`}
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              onClick={() => onChange(!enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
