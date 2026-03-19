"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
import { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository';
import { CourseTutorRepository } from '@/_core/modules/content/infrastructure/repositories/CourseTutorRepository';
import { TimeSlotRepository } from '@/_core/modules/tutoring/infrastructure/repositories/TimeSlotRepository';
import { User, UserRole } from '@/_core/modules/user/core/entities/User';
import { Institution } from '@/_core/modules/institution/core/entities/Institution';
import { UserInstitution } from '@/_core/modules/institution/core/entities/UserInstitution';
import { SelectComponent } from '@/components/select';
import { Button } from '@/components/button';
import { LoadingSpinner } from '@/components/loader';
import { FiTrash2, FiPlus, FiUser, FiMail, FiShield, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';

type UserRoleAssignment = {
  id: string;
  institutionId: string;
  institutionName: string;
  role: UserRole;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { infoUser } = useProfile();
  
  const [user, setUser] = useState<User | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [tutorWarningRole, setTutorWarningRole] = useState<UserRoleAssignment | null>(null);

  const [newRoleInstitution, setNewRoleInstitution] = useState<string>('');
  const [newRoleType, setNewRoleType] = useState<UserRole | ''>('');

  const currentRole = infoUser.currentRole;
  const hasAccess = ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'LOCAL_ADMIN'].includes(currentRole || '');

  useEffect(() => {
    if (!currentRole) return;
    if (!hasAccess) {
      router.push('/');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
      const institutionRepository = container.get<InstitutionRepository>(Register.institution.repository.InstitutionRepository);
      const userInstitutionRepository = container.get<UserInstitutionRepository>(Register.institution.repository.UserInstitutionRepository);

      // Load user
      const userData = await userRepository.findById(userId);
      if (!userData) {
        alert('Usuário não encontrado');
        router.push('/admin/allusers');
        return;
      }
      setUser(userData);

      // Load all institutions
      const allInstitutions = await institutionRepository.list();
      setInstitutions(allInstitutions);

      // Load user's current role assignments
      const associations = await userInstitutionRepository.findByUserId(userId);
      
      const roleAssignments: UserRoleAssignment[] = associations.map(assoc => {
        const institution = allInstitutions.find(inst => inst.id === assoc.institutionId);
        return {
          id: assoc.id,
          institutionId: assoc.institutionId,
          institutionName: institution?.name || 'Instituição desconhecida',
          role: assoc.userRole
        };
      });

      setUserRoles(roleAssignments);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleInstitution || !newRoleType) {
      alert('Por favor, selecione uma instituição e uma role');
      return;
    }

    // Guard síncrono para evitar duplo clique antes do estado re-renderizar
    if (addingRef.current) return;
    addingRef.current = true;
    setAdding(true);

    try {
      const userInstitutionRepository = container.get<UserInstitutionRepository>(Register.institution.repository.UserInstitutionRepository);

      // Verificar no banco (não apenas no estado local) para evitar duplicatas
      const currentAssociations = await userInstitutionRepository.findByUserId(userId);
      const alreadyExists = currentAssociations.some(
        a => a.institutionId === newRoleInstitution && a.userRole === newRoleType
      );

      if (alreadyExists) {
        alert('Este usuário já possui esta role nesta instituição.');
        return;
      }

      const associationId = await userInstitutionRepository.generateId();
      const newAssociation = UserInstitution.create({
        id: associationId,
        userId: userId,
        institutionId: newRoleInstitution,
        userRole: newRoleType as UserRole
      });

      await userInstitutionRepository.save(newAssociation);

      const institution = institutions.find(inst => inst.id === newRoleInstitution);
      // Atualização funcional evita stale closure
      setUserRoles(prev => [
        ...prev,
        {
          id: associationId,
          institutionId: newRoleInstitution,
          institutionName: institution?.name || 'Instituição desconhecida',
          role: newRoleType as UserRole
        }
      ]);

      setNewRoleInstitution('');
      setNewRoleType('');

      alert('Role adicionada com sucesso!');
    } catch (error) {
      console.error('Error adding role:', error);
      alert('Erro ao adicionar role. Tente novamente.');
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  const handleRemoveRole = async (roleAssignment: UserRoleAssignment) => {
    if (userRoles.length <= 1) {
      alert('O usuário deve ter pelo menos 1 permissão. Não é possível remover a última role.');
      return;
    }

    if (roleAssignment.role === UserRole.TUTOR) {
      setTutorWarningRole(roleAssignment);
      return;
    }

    if (!confirm(`Tem certeza que deseja remover a role "${getRoleLabel(roleAssignment.role)}" da instituição "${roleAssignment.institutionName}"?`)) {
      return;
    }

    await executeRemoveRole(roleAssignment);
  };

  const executeRemoveRole = async (roleAssignment: UserRoleAssignment) => {
    try {
      setRemoving(roleAssignment.id);
      setTutorWarningRole(null);

      const userInstitutionRepository = container.get<UserInstitutionRepository>(Register.institution.repository.UserInstitutionRepository);

      if (roleAssignment.role === UserRole.TUTOR) {
        const courseTutorRepository = container.get<CourseTutorRepository>(Register.content.repository.CourseTutorRepository);
        const timeSlotRepository = container.get<TimeSlotRepository>(Register.tutoring.repository.TimeSlotRepository);

        const courseTutors = await courseTutorRepository.findByUserId(userId);
        await Promise.all(courseTutors.map(ct => courseTutorRepository.delete(ct.id)));

        await timeSlotRepository.deleteByTutorId(userId);

        const allUserInstitutions = await userInstitutionRepository.findByUserId(userId);
        const tutorInstitutions = allUserInstitutions.filter(
          ui => ui.userRole === UserRole.TUTOR
        );
        await Promise.all(tutorInstitutions.map(ui => userInstitutionRepository.delete(ui.id)));

        setUserRoles(prev => prev.filter(r => r.role !== UserRole.TUTOR));
      } else {
        await userInstitutionRepository.delete(roleAssignment.id);
        setUserRoles(prev => prev.filter(r => r.id !== roleAssignment.id));
      }

      alert('Role removida com sucesso!');
    } catch (error) {
      console.error('Error removing role:', error);
      alert('Erro ao remover role. Tente novamente.');
    } finally {
      setRemoving(null);
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      SUPER_ADMIN: 'Super Admin',
      SYSTEM_ADMIN: 'Admin do Sistema',
      LOCAL_ADMIN: 'Admin Local',
      CONTENT_MANAGER: 'Gestor de Conteúdo',
      TUTOR: 'Tutor',
      STUDENT: 'Estudante'
    };
    return labels[role];
  };

  const availableRoles: UserRole[] = [
    UserRole.LOCAL_ADMIN,
    UserRole.CONTENT_MANAGER,
    UserRole.TUTOR,
    UserRole.STUDENT
  ];

  if (!hasAccess) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 max-w-5xl">
      {/* Header com gradiente */}
      <div className="mb-8">
        <Button
          onClick={() => router.push('/admin/allusers')}
          className="mb-6 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow"
        >
          Voltar para Lista
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              {user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <FiShield className="w-4 h-4" />
              Gerenciar Permissões e Roles
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiMail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.email.value}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Role Principal</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getRoleLabel(user.role)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total de Roles</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{userRoles.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Roles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiShield className="w-6 h-6 text-blue-600" />
          Roles Atuais
        </h2>
        
        {userRoles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <FiShield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma role associada ainda.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adicione roles abaixo para dar permissões ao usuário</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userRoles.map((roleAssignment) => (
              <div
                key={roleAssignment.id}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <FiShield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{getRoleLabel(roleAssignment.role)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      🏢 {roleAssignment.institutionName}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveRole(roleAssignment);
                  }}
                  disabled={removing === roleAssignment.id}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all hover:scale-105 shadow hover:shadow-lg disabled:opacity-50"
                  title="Remover role"
                >
                  <FiTrash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Role */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiPlus className="w-6 h-6 text-green-600" />
          Adicionar Nova Role
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              🏢 Instituição
            </label>
            <SelectComponent
              value={newRoleInstitution}
              onChange={setNewRoleInstitution}
              options={institutions.map(inst => ({
                value: inst.id,
                label: inst.name
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiShield className="w-4 h-4" />
              Role
            </label>
            <SelectComponent
              value={newRoleType}
              onChange={(value) => setNewRoleType(value as UserRole)}
              options={availableRoles.map(role => ({
                value: role,
                label: getRoleLabel(role)
              }))}
            />
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            handleAddRole();
          }}
          disabled={adding || !newRoleInstitution || !newRoleType}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          {adding ? 'Adicionando...' : 'Adicionar Permissão'}
        </Button>
      </div>
        </div>

        {tutorWarningRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Remover permissão de Tutor
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                <strong className="text-red-600">AVISO:</strong> Os vínculos serão removidos e é irreversível. Deseja continuar?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Serão excluídos: vínculos com cursos, horários de disponibilidade e associações com instituições como tutor.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setTutorWarningRole(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => executeRemoveRole(tutorWarningRole)}
                  disabled={removing === tutorWarningRole.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {removing === tutorWarningRole.id ? 'Removendo...' : 'Sim, remover'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedContent>
  );
}
