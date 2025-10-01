'use client';

import React from 'react';
import { Button } from '@/components/button'

interface ThresholdSliderProps {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  defaultValue?: number;
  onReset?: () => void;
}

export function ThresholdSlider({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  defaultValue,
  onReset
}: ThresholdSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {value}{unit}
          </span>
          {defaultValue !== undefined && onReset && (
            <Button
              type="button"
              onClick={onReset}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
              title={`Reset to default (${defaultValue}${unit})`}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}