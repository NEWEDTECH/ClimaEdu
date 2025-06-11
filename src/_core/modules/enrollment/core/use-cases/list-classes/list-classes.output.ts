import { Class } from "../../entities/Class";

export class ListClassesOutput {
  constructor(public readonly classes: Class[]) {}
}
