import { NextRequest, NextResponse } from 'next/server';
import { scormContainer } from '../../container';
import { ListScormsByInstitutionUseCase } from '../../../../../_core/modules/content/core/use-cases/list-scorms-by-institution/list-scorms-by-institution.use-case';

export async function GET(
  req: NextRequest,
  { params }: { params: { institutionId: string } }
) {
  try {
    const { institutionId } = params;

    if (!institutionId) {
      return NextResponse.json(
        { error: 'Missing institutionId parameter' },
        { status: 400 }
      );
    }

    const listUseCase = scormContainer.get(ListScormsByInstitutionUseCase);
    const result = await listUseCase.execute({ institutionId });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('List SCORM Content Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
