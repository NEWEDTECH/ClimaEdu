import { inject, injectable } from "inversify";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { ListClassesInput } from "./list-classes.input";
import { ListClassesOutput } from "./list-classes.output";

@injectable()
export class ListClassesUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: ListClassesInput): Promise<ListClassesOutput> {
    const classes = await this.classRepository.findAll(input.institutionId);
    return new ListClassesOutput(classes);
  }
}
