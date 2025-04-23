"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import FormUpdateData from '@/components/formUpdateData/settingsUpdateData';


export default function SeetingsStudent() {
    return (
        <ProtectedContent>
            <DashboardLayout>
                <FormUpdateData />
            </DashboardLayout>
        </ProtectedContent>
    )
}