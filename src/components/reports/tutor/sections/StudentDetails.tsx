import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentInfo } from '@/_core/modules/report/core/use-cases/generate-individual-student-report/generate-individual-student-report.output';

type StudentDetailsProps = {
  data: StudentInfo;
};

export function StudentDetails({ data }: StudentDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.studentName}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Email</p>
          <p>{data.email}</p>
        </div>
        <div>
          <p className="font-medium">Status</p>
          <p>{data.status}</p>
        </div>
        <div>
          <p className="font-medium">Data de Matrícula</p>
          <p>{new Date(data.enrollmentDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="font-medium">Último Login</p>
          <p>{data.lastLoginDate ? new Date(data.lastLoginDate).toLocaleString() : 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium">Perfil Completo</p>
          <p>{data.profileCompleteness}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
