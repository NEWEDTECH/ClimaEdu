"use client";

import { useEffect, useState } from 'react';
import { useProfile } from '@/context/zustand/useProfile';
import { container } from '@/_core/shared/container';
import { Register } from '@/_core/shared/container';
import { UserRepository } from '@/_core/modules/user/infrastructure/repositories/UserRepository';
import { InstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/InstitutionRepository';
import { UserInstitutionRepository } from '@/_core/modules/institution/infrastructure/repositories/UserInstitutionRepository';
import { User, UserRole } from '@/_core/modules/user/core/entities/User';
import { Institution } from '@/_core/modules/institution/core/entities/Institution';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SelectComponent } from '@/components/select';
import { LoadingSpinner } from '@/components/loader';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { FiEdit2, FiTrash2, FiSearch, FiUsers, FiFilter } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { Pagination } from '@/components/pagination/Pagination';

type UserWithInstitution = {
  id: string;
  name: string;
  email: string;
  roles: Array<{
    role: UserRole;
    institutionId: string;
    institutionName: string;
    createdAt: Date;
  }>;
  createdAt: Date;
};

export default function AllUsersPage() {
  const router = useRouter();
  const { infoUser } = useProfile();
  const [users, setUsers] = useState<UserWithInstitution[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithInstitution[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserWithInstitution | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 15;

  const currentRole = infoUser.currentRole;
  const currentInstitutionId = infoUser.currentIdInstitution;

  // Check if user has permission to access this page
  const hasAccess = ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'LOCAL_ADMIN'].includes(currentRole || '');

  useEffect(() => {
    if (!hasAccess) {
      router.push('/');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
      const institutionRepository = container.get<InstitutionRepository>(Register.institution.repository.InstitutionRepository);
      const userInstitutionRepository = container.get<UserInstitutionRepository>(Register.institution.repository.UserInstitutionRepository);

      // Load all institutions
      const allInstitutions = await institutionRepository.list();
      setInstitutions(allInstitutions);

      // Load users based on role
      let usersData: UserWithInstitution[] = [];

      if (currentRole === 'SUPER_ADMIN' || currentRole === 'SYSTEM_ADMIN') {
        // Load all users from Firestore
        const allUsers = await loadAllUsers(userRepository);
        
        // For each user, load their institution associations
        const usersWithInstitutions = await Promise.all(
          allUsers.map(async (user) => {
            const associations = await userInstitutionRepository.findByUserId(user.id);
            
            const roles = await Promise.all(
              associations.map(async (assoc) => {
                const institution = allInstitutions.find(inst => inst.id === assoc.institutionId);
                return {
                  role: assoc.userRole,
                  institutionId: assoc.institutionId,
                  institutionName: institution?.name || 'Instituição desconhecida',
                  createdAt: assoc.createdAt
                };
              })
            );

            // Sort roles by createdAt DESC (most recent first)
            roles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            // If user is SUPER_ADMIN, add a special role entry
            if (user.role === UserRole.SUPER_ADMIN) {
              roles.unshift({
                role: UserRole.SUPER_ADMIN,
                institutionId: '',
                institutionName: 'Todas as instituições',
                createdAt: user.createdAt
              });
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email.value,
              roles: roles.length > 0 ? roles : [{
                role: user.role,
                institutionId: '',
                institutionName: 'N/A',
                createdAt: user.createdAt
              }],
              createdAt: user.createdAt
            };
          })
        );

        usersData = usersWithInstitutions;
      } else if (currentRole === 'LOCAL_ADMIN') {
        // Load only users from current institution
        const associations = await userInstitutionRepository.findByInstitutionId(currentInstitutionId);
        
        const usersWithInstitutions = await Promise.all(
          associations.map(async (assoc) => {
            const user = await userRepository.findById(assoc.userId);
            if (!user) return null;

            const institution = allInstitutions.find(inst => inst.id === assoc.institutionId);
            
            return {
              id: user.id,
              name: user.name,
              email: user.email.value,
              roles: [{
                role: assoc.userRole,
                institutionId: assoc.institutionId,
                institutionName: institution?.name || 'Instituição desconhecida',
                createdAt: assoc.createdAt
              }],
              createdAt: user.createdAt
            };
          })
        );

        usersData = usersWithInstitutions.filter(u => u !== null) as UserWithInstitution[];
        
        // Set the institution filter to current institution and disable it
        setSelectedInstitution(currentInstitutionId);
      }

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async (userRepository: UserRepository): Promise<User[]> => {
    // Since we don't have a listAll method, we'll load users by each role
    const roles = [
      UserRole.SUPER_ADMIN,
      UserRole.SYSTEM_ADMIN,
      UserRole.LOCAL_ADMIN,
      UserRole.CONTENT_MANAGER,
      UserRole.TUTOR,
      UserRole.STUDENT
    ];

    const usersByRole = await Promise.all(
      roles.map(role => userRepository.listByType(role))
    );

    // Flatten and deduplicate users
    const allUsers = usersByRole.flat();
    const uniqueUsers = Array.from(
      new Map(allUsers.map(user => [user.id, user])).values()
    );

    return uniqueUsers;
  };

  useEffect(() => {
    // Apply filters
    let filtered = [...users];

    // Filter by institution
    if (selectedInstitution) {
      filtered = filtered.filter(user => 
        user.roles.some(r => r.institutionId === selectedInstitution)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedInstitution, searchTerm, users]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/allusers/edit/${userId}`);
  };

  const handleDeleteClick = (user: UserWithInstitution) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      const userRepository = container.get<UserRepository>(Register.user.repository.UserRepository);
      const userInstitutionRepository = container.get<UserInstitutionRepository>(Register.institution.repository.UserInstitutionRepository);

      // Delete user-institution associations
      const associations = await userInstitutionRepository.findByUserId(userToDelete.id);
      await Promise.all(
        associations.map(assoc => userInstitutionRepository.delete(assoc.id))
      );

      // Delete user
      await userRepository.delete(userToDelete.id);

      // Remove from local state
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setFilteredUsers(filteredUsers.filter(u => u.id !== userToDelete.id));

      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao excluir usuário. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderPermissionsCell = (user: UserWithInstitution) => {
    if (user.roles.length === 1) {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{getRoleLabel(user.roles[0].role)}</span>
          <span className="text-xs text-gray-500">{user.roles[0].institutionName}</span>
        </div>
      );
    }

    const mostRecentRole = user.roles[0];
    const additionalRolesCount = user.roles.length - 1;

    return (
      <div 
        className="relative"
        onMouseEnter={() => setHoveredUser(user.id)}
        onMouseLeave={() => setHoveredUser(null)}
      >
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="flex flex-col">
            <span className="font-medium">{getRoleLabel(mostRecentRole.role)}</span>
            <span className="text-xs text-gray-500">{mostRecentRole.institutionName}</span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            +{additionalRolesCount}
          </span>
        </div>

        {hoveredUser === user.id && (
          <div className="absolute z-10 bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 mt-1 border border-gray-200 dark:border-gray-700 min-w-[250px]">
            <div className="text-sm font-semibold mb-2">Todas as Permissões:</div>
            <div className="space-y-2">
              {user.roles.map((role, index) => (
                <div key={index} className="flex flex-col py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="font-medium text-sm">{getRoleLabel(role.role)}</span>
                  <span className="text-xs text-gray-500">{role.institutionName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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

  const isLocalAdmin = currentRole === 'LOCAL_ADMIN';

  return (
    <ProtectedContent>
      <DashboardLayout>
        <div className="container mx-auto p-6 max-w-7xl">
      {/* Header com gradiente */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              Visualize e gerencie todos os usuários da plataforma
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/create-user')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            Criar Usuário
          </Button>
        </div>

      </div>

      {/* Filters com design melhorado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiFilter className="w-5 h-5 text-blue-600" />
          Filtros de Busca
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Filtrar por Instituição
            </label>
            <SelectComponent
              value={selectedInstitution}
              onChange={setSelectedInstitution}
              options={[
                { value: '', label: '🏢 Todas as instituições' },
                ...institutions.map(inst => ({
                  value: inst.id,
                  label: inst.name
                }))
              ]}
              disabled={isLocalAdmin}
              placeholder="Selecione uma instituição"
            />
            {isLocalAdmin && (
              <p className="text-xs text-gray-500 mt-1">Visualização restrita à sua instituição</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Buscar Usuário
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou email..."
                className="flex h-11 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table com design melhorado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{renderPermissionsCell(user)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleEdit(user.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 shadow hover:shadow-lg"
                        title="Editar usuário"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all hover:scale-105 shadow hover:shadow-lg"
                        title="Excluir usuário"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary e Paginação */}
      <div className="mt-6 space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <FiUsers className="w-4 h-4" />
            <span>
              Exibindo <span className="font-semibold text-blue-600 dark:text-blue-400">{startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</span> de <span className="font-semibold">{filteredUsers.length}</span> usuários filtrados ({users.length} no total)
            </span>
          </div>
          {filteredUsers.length !== users.length && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full">
              Filtros ativos
            </span>
          )}
        </div>

        {/* Paginação */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>

      {/* Delete Confirmation Modal com design melhorado */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <FiTrash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center">Confirmar Exclusão</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400 text-center">
              Tem certeza que deseja excluir o usuário <br/>
              <strong className="text-gray-900 dark:text-white text-lg">{userToDelete.name}</strong>?<br/>
              <span className="text-sm text-red-600 dark:text-red-400">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </DashboardLayout>
    </ProtectedContent>
  );
}
