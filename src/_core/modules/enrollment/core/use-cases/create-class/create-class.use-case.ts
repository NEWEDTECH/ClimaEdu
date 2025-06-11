import { inject, injectable } from "inversify";
import { Class } from "../../entities/Class";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { CreateClassInput } from "./create-class.input";
import { CreateClassOutput } from "./create-class.output";

@injectable()
export class CreateClassUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: CreateClassInput): Promise<CreateClassOutput> {
    const id = await this.classRepository.generateId();

    const klass = Class.create({
      id,
      institutionId: input.institutionId,
      name: input.name,
      courseId: input.courseId,
      trailId: input.trailId,
      enrollmentIds: [],
    });

    await this.classRepository.save(klass);

    return new CreateClassOutput(klass);
  }
}
