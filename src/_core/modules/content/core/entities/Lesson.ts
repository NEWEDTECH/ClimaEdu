import { Activity } from './Activity';
import { Content } from './Content';
import { Questionnaire } from './Questionnaire';

/**
 * Lesson entity representing a lesson in a module
 * Following Clean Architecture principles, this entity is pure and has no dependencies on infrastructure
 */
export class Lesson {
  private constructor(
    readonly id: string,
    readonly moduleId: string,
    public title: string,
    public contents: Content[],
    public order: number,
    public activity?: Activity,
    public questionnaire?: Questionnaire
  ) {}

  /**
   * Creates a new Lesson instance
   * @param params Lesson properties
   * @returns A new Lesson instance
   * @throws Error if validation fails
   */
  public static create(params: {
    id: string;
    moduleId: string;
    title: string;
    order: number;
    contents?: Content[];
    activity?: Activity;
    questionnaire?: Questionnaire;
  }): Lesson {
    if (!params.title || params.title.trim() === '') {
      throw new Error('Lesson title cannot be empty');
    }

    if (params.order < 0) {
      throw new Error('Lesson order must be a non-negative number');
    }

    return new Lesson(
      params.id,
      params.moduleId,
      params.title,
      params.contents || [],
      params.order,
      params.activity,
      params.questionnaire
    );
  }

  /**
   * Adds content to the lesson
   * @param content The content to add
   */
  public addContent(content: Content): void {
    this.contents.push(content);
  }

  /**
   * Attaches an activity to the lesson
   * @param activity The activity to attach
   */
  public attachActivity(activity: Activity): void {
    this.activity = activity;
  }

  /**
   * Attaches a questionnaire to the lesson
   * @param questionnaire The questionnaire to attach
   */
  public attachQuestionnaire(questionnaire: Questionnaire): void {
    this.questionnaire = questionnaire;
  }

  /**
   * Updates the lesson title
   * @param newTitle The new title
   * @throws Error if the new title is empty
   */
  public updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Lesson title cannot be empty');
    }
    this.title = newTitle;
  }
}
