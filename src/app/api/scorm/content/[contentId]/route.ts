import { NextRequest, NextResponse } from 'next/server';
import { scormContainer } from '../../container';
import { GetScormContentUseCase } from '../../../../../_core/modules/content/core/use-cases/get-scorm-content/get-scorm-content.use-case';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Missing contentId parameter' },
        { status: 400 }
      );
    }

    const getUseCase = scormContainer.get(GetScormContentUseCase);
    const result = await getUseCase.execute({ id: contentId });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get SCORM Content Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
