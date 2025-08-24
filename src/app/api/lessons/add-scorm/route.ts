import { NextRequest, NextResponse } from 'next/server';
import { scormContainer } from '../../scorm/container';
import { AddScormToLessonUseCase } from '../../../../_core/modules/content/core/use-cases/add-scorm-to-lesson/add-scorm-to-lesson.use-case';

export async function POST(req: NextRequest) {
  try {
    const { lessonId, scormContentId, name } = await req.json();

    if (!lessonId || !scormContentId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, scormContentId, name' },
        { status: 400 }
      );
    }

    const addScormUseCase = scormContainer.get(AddScormToLessonUseCase);
    const result = await addScormUseCase.execute({
      lessonId,
      scormContentId,
      name,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Add SCORM to Lesson Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
