import { inject, injectable } from 'inversify';
import type { IScormContentRepository } from '../../../infrastructure/repositories/ScormContentRepository';
import { UploadScormContentInput } from './upload-scorm-content.input';
import { UploadScormContentOutput } from './upload-scorm-content.output';
import unzipper from 'unzipper';
import { parseStringPromise } from 'xml2js';

@injectable()
export class UploadScormContentUseCase {
  constructor(
    @inject('IScormContentRepository')
    private readonly scormContentRepository: IScormContentRepository
  ) {}

  async execute(
    input: UploadScormContentInput
  ): Promise<UploadScormContentOutput> {
    const { file, name, institutionId } = input;

    const zip = await unzipper.Open.buffer(file);
    const manifestEntry = zip.files.find(
      (f) => f.path.toLowerCase() === 'imsmanifest.xml'
    );

    if (!manifestEntry) {
      throw new Error('imsmanifest.xml not found in the SCORM package.');
    }

    const manifestData = await manifestEntry.buffer();
    const manifestJson = await parseStringPromise(manifestData.toString('utf-8'));

    const resource = manifestJson.manifest.resources[0].resource[0];
    const launchUrl = resource.$.href;

    const scormContent = {
      name,
      institutionId,
      launchUrl,
      storageBasePath: '', // Será definido no repositório
    };

    const savedContent = await this.scormContentRepository.save(
      file,
      scormContent
    );

    return {
      id: savedContent.id,
    };
  }
}
