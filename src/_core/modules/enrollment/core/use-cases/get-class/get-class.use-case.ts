import { inject, injectable } from "inversify";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { GetClassInput } from "./get-class.input";
import { GetClassOutput } from "./get-class.output";

@injectable()
export class GetClassUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: GetClassInput): Promise<GetClassOutput> {
    const klass = await this.classRepository.findById(input.id);
    return new GetClassOutput(klass);
  }
}
