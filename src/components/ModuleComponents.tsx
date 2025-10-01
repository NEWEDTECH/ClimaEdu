'use client';

import { useEffect, useState } from 'react';
import { container, Register } from '@/_core/shared/container';
import { CreateUserUseCase, UserRole } from '@/_core/modules/user';
import { CreateContentUseCase, AssociateTutorToCourseUseCase } from '@/_core/modules/content';
import { ContentType } from '@/_core/modules/content/core/entities/ContentType';
import { AssociateUserToInstitutionUseCase } from '@/_core/modules/institution';
import { Button } from '@/components/button'

export function UserModule() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  const handleCreateUser = async () => {
    try {
      const createUserUseCase = container.get<CreateUserUseCase>(
        Register.user.useCase.CreateUserUseCase
      );

      const result = await createUserUseCase.execute({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        type: UserRole.STUDENT,
      });

      alert(`User created successfully! ID: ${result.user.id}`);
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${(error as Error).message}`);
    }
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">User Module</h3>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Entities: User</li>
        <li>Use Cases: CreateUserUseCase</li>
        <li>Repositories: UserRepository</li>
        <li>Implementations: FirebaseUserRepository</li>
      </ul>
      {isReady && (
        <Button
          onClick={handleCreateUser}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Test User Creation
        </Button>
      )}
    </div>
  );
}

export function InstitutionModule() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  const handleAssociateUserToInstitution = async () => {
    try {
      const associateUserToInstitutionUseCase = container.get<AssociateUserToInstitutionUseCase>(
        Register.institution.useCase.AssociateUserToInstitutionUseCase
      );

      const result = await associateUserToInstitutionUseCase.execute({
        userId: 'user-id', // Replace with an actual user ID
        institutionId: 'institution-id', // Replace with an actual institution ID
        userRole: UserRole.LOCAL_ADMIN, // Specify the role for the association
      });

      alert(`User associated to institution successfully! Association ID: ${result.userInstitution.id}`);
    } catch (error) {
      console.error('Error associating user to institution:', error);
      alert(`Error associating user to institution: ${(error as Error).message}`);
    }
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Institution Module</h3>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Entities: Institution, UserInstitution</li>
        <li>Use Cases: AssociateUserToInstitutionUseCase</li>
        <li>Repositories: InstitutionRepository, UserInstitutionRepository</li>
        <li>Implementations: FirebaseInstitutionRepository, FirebaseUserInstitutionRepository</li>
      </ul>
      {isReady && (
        <Button
          onClick={handleAssociateUserToInstitution}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Test User to Institution Association
        </Button>
      )}
    </div>
  );
}

export function ContentModule() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  const handleAssociateTutorToCourse = async () => {
    try {
      const associateTutorToCourseUseCase = container.get<AssociateTutorToCourseUseCase>(
        Register.content.useCase.AssociateTutorToCourseUseCase
      );

      const result = await associateTutorToCourseUseCase.execute({
        userId: 'tutor-user-id', // Replace with an actual user ID
        courseId: 'course-id', // Replace with an actual course ID
      });

      alert(`Tutor associated successfully! Association ID: ${result.courseTutor.id}`);
    } catch (error) {
      console.error('Error associating tutor:', error);
      alert(`Error associating tutor: ${(error as Error).message}`);
    }
  };
  
  const handleCreateContent = async () => {
    try {
      const createContentUseCase = container.get<CreateContentUseCase>(
        Register.content.useCase.CreateContentUseCase
      );

      const result = await createContentUseCase.execute({
        lessonId: 'test-lesson-id',
        title: 'Test Content',
        type: ContentType.PDF,
        url: 'https://example.com/test-content',
      });

      alert(`Content created successfully! ID: ${result.content.id}`);
    } catch (error) {
      console.error('Error creating content:', error);
      alert(`Error creating content: ${(error as Error).message}`);
    }
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-2">Content Module</h3>
      <ul className="list-disc list-inside text-sm space-y-1">
        <li>Entities: Content, Course, CourseTutor</li>
        <li>Use Cases: CreateContentUseCase, AssociateTutorToCourseUseCase</li>
        <li>Repositories: ContentRepository, CourseTutorRepository</li>
        <li>Implementations: FirebaseContentRepository, FirebaseCourseTutorRepository</li>
      </ul>
      {isReady && (
        <div className="flex flex-col space-y-2 mt-4">
          <Button
            onClick={handleCreateContent}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Test Content Creation
          </Button>
          <Button
            onClick={handleAssociateTutorToCourse}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Test Tutor Association
          </Button>
        </div>
      )}
    </div>
  );
}
