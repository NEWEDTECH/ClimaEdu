'use client';

import { useEffect, useState } from 'react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import { Institution } from '@/_core/modules/institution/core/entities/Institution';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { UserRole } from '@/_core/modules/user/core/entities/User';
import { EnrollmentRepository } from '@/_core/modules/enrollment/infrastructure/repositories/EnrollmentRepository';
import { CourseRepository } from '@/_core/modules/content/infrastructure/repositories/CourseRepository';
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
import { useProfile, InstitutionWithRole } from '@/context/zustand/useProfile';
import { useInstitutionStorage } from '@/context/zustand/useInstitutionStorage';

/**
 * Component that lists institutions where the user has enrollments
 * Fetches institutions through user enrollments -> courses -> institutions
 */
export function UserInstitutionsList() {
  const { 
    id, 
    setInstitutions, 
    setInstitution, 
    setInstitutionsWithRoles,
    institutions,
    getUserRoleInInstitution 
  } = useProfile();
  const { getLastInstitutionId, setLastInstitutionId } = useInstitutionStorage();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para mapear UserRole do domínio para o tipo do useProfile
  const mapUserRoleToProfileRole = (userRole: UserRole): 'student' | 'tutor' | 'admin' => {
    switch (userRole) {
      case UserRole.STUDENT:
        return 'student';
      case UserRole.TUTOR:
        return 'tutor';
      case UserRole.ADMINISTRATOR:
        return 'admin';
      default:
        return 'student'; // fallback
    }
  };

  useEffect(() => {
    // Only fetch institutions if we have a user ID
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchInstitutionsFromEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get repositories from the container
        const userRepository = container.get<UserRepository>(
          Register.user.repository.UserRepository
        );
        
        const enrollmentRepository = container.get<EnrollmentRepository>(
          Register.enrollment.repository.EnrollmentRepository
        );
        
        const courseRepository = container.get<CourseRepository>(
          Register.content.repository.CourseRepository
        );
        
        const institutionRepository = container.get<InstitutionRepository>(
          Register.institution.repository.InstitutionRepository
        );

        const user = await userRepository.findById(id);
        
        if (!user) {
          throw new Error('User not found');
        }

        // Get user enrollments
        const enrollments = await enrollmentRepository.listByUser(id);

        if (enrollments.length === 0) {
          setInstitutions([]);
          setInstitutionsWithRoles([]);
          setLoading(false);
          return;
        }

        const courseIds = [...new Set(enrollments.map(enrollment => enrollment.courseId))];

        const institutionIds = new Set<string>();
        
        for (const courseId of courseIds) {
          const course = await courseRepository.findById(courseId);

          if (course && course.institutionId) {
            console.log(course.institutionId)
            institutionIds.add(course.institutionId);
          }
        }

        const institutions: Institution[] = [];
        
        for (const institutionId of institutionIds) {
          const institution = await institutionRepository.findById(institutionId);
          if (institution) {
            institutions.push(institution);
          }
        }

        const institutionsWithRoles: InstitutionWithRole[] = institutions.map(institution => ({
          institution,
          userRole: mapUserRoleToProfileRole(user.role)
        }));


        setInstitutions(institutions);
        setInstitutionsWithRoles(institutionsWithRoles);

        const lastInstitutionId = getLastInstitutionId();
        let institutionToSet = institutions[0]; 

        if (lastInstitutionId) {
          const lastInstitution = institutions.find(inst => inst.id === lastInstitutionId);
          if (lastInstitution) {
            institutionToSet = lastInstitution;
          }
        }

        // Set the active institution
        if (institutionToSet) {
          setInstitution(institutionToSet);
          setLastInstitutionId(institutionToSet.id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user institutions from enrollments:', error);
        setError('Failed to load institutions. Please try again later.');
        setLoading(false);
      }
    };

    fetchInstitutionsFromEnrollments();
  }, [id, setInstitutions, setInstitution, setInstitutionsWithRoles, getLastInstitutionId, setLastInstitutionId]);

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // If there are no institutions, show a message
  if (!institutions || institutions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Você não está matriculado em cursos de nenhuma instituição.</p>
      </div>
    );
  }

  // Função para obter a cor da badge baseada na role
  const getRoleBadgeColor = (role: 'student' | 'tutor' | 'admin' | null) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'tutor':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'student':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Função para obter o texto da role em português
  const getRoleText = (role: 'student' | 'tutor' | 'admin' | null) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'tutor':
        return 'Tutor';
      case 'student':
        return 'Estudante';
      default:
        return 'Usuário';
    }
  };

  // Render the list of institutions
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Suas Instituições</h3>
      <ul className="space-y-2">
        {institutions.map((institution: Institution) => {
          const userRole = getUserRoleInInstitution(institution.id);
          return (
            <li 
              key={institution.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              onClick={() => {
                setInstitution(institution);
                setLastInstitutionId(institution.id);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{institution.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{institution.domain}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(userRole)}`}>
                  {getRoleText(userRole)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
