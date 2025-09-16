import { injectable, inject } from 'inversify';
import { nanoid } from 'nanoid';
import type { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { Register } from '@/_core/shared/container';
import { ProcessCSVUsersInput } from './process-csv-users.input';
import { ProcessCSVUsersOutput } from './process-csv-users.output';
import { Email } from '../../entities/Email';
import { User, UserRole } from '../../entities/User';

/**
 * Use case for processing CSV data and creating multiple users
 * Following Clean Architecture principles, this use case depends only on the repository interface
 */
@injectable()
export class ProcessCSVUsersUseCase {
  constructor(
    @inject(Register.user.repository.UserRepository)
    private userRepository: UserRepository,
    
    @inject(Register.auth.service.AuthService)
    private authService: AuthService
  ) {}

  /**
   * Execute the use case
   * @param input Input data
   * @returns Output data
   */
  async execute(input: ProcessCSVUsersInput): Promise<ProcessCSVUsersOutput> {
    const { csvData, institutionId, createdByUserId, createdByUserRole } = input;
    
    // Validate CSV has email column
    if (csvData.length === 0) {
      throw new Error('CSV data is empty');
    }

    const firstRow = csvData[0];
    const hasEmailColumn = Object.keys(firstRow).some(key => 
      key.toLowerCase().trim() === 'email'
    );

    if (!hasEmailColumn) {
      throw new Error('CSV must contain an "email" column');
    }

    const createdUsers: User[] = [];
    const failedEmails: Array<{ email: string; error: string }> = [];

    // Process each row
    for (const row of csvData) {
      try {
        const emailValue = this.extractEmailFromRow(row);
        
        if (!emailValue || emailValue.trim() === '') {
          failedEmails.push({
            email: 'empty',
            error: 'Email is empty or missing'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(emailValue);
        if (existingUser) {
          failedEmails.push({
            email: emailValue,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Determine user role based on CSV data or default to STUDENT
        const userRole = this.determineUserRole(row, createdByUserRole);
        
        // Extract name from CSV or use email as fallback
        const userName = this.extractNameFromRow(row, emailValue);

        // Create user in Firebase Authentication
        const authUserId = await this.authService.createUserWithEmailAndPassword(
          emailValue,
          nanoid(8) // Generate random password
        );
        
        // Create email value object
        const email = Email.create(emailValue);

        // Create user entity
        const user = User.create({
          id: authUserId,
          name: userName,
          email: email,
          role: userRole
        });

        // Save user to Firestore
        const savedUser = await this.userRepository.save(user);
        createdUsers.push(savedUser);

      } catch (error) {
        const emailValue = this.extractEmailFromRow(row) || 'unknown';
        failedEmails.push({
          email: emailValue,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }

    return {
      createdUsers,
      failedEmails,
      totalProcessed: csvData.length,
      totalCreated: createdUsers.length,
      totalFailed: failedEmails.length
    };
  }

  /**
   * Extract email from CSV row (case-insensitive)
   */
  private extractEmailFromRow(row: Record<string, string>): string {
    const emailKey = Object.keys(row).find(key => 
      key.toLowerCase().trim() === 'email'
    );
    return emailKey ? row[emailKey].trim() : '';
  }

  /**
   * Extract name from CSV row or use email as fallback
   */
  private extractNameFromRow(row: Record<string, string>, emailFallback: string): string {
    // Try to find name column (case-insensitive)
    const nameKey = Object.keys(row).find(key => {
      const lowerKey = key.toLowerCase().trim();
      return lowerKey === 'name' || lowerKey === 'nome' || lowerKey === 'full_name' || lowerKey === 'fullname';
    });

    if (nameKey && row[nameKey].trim()) {
      return row[nameKey].trim();
    }

    // Use email prefix as fallback
    return emailFallback.split('@')[0];
  }

  /**
   * Determine user role based on CSV data and creator permissions
   */
  private determineUserRole(row: Record<string, string>, createdByUserRole: UserRole): UserRole {
    // Try to find role/type column
    const roleKey = Object.keys(row).find(key => {
      const lowerKey = key.toLowerCase().trim();
      return lowerKey === 'role' || lowerKey === 'type' || lowerKey === 'tipo' || lowerKey === 'perfil';
    });

    if (roleKey && row[roleKey].trim()) {
      const roleValue = row[roleKey].trim().toLowerCase();
      
      // Map common role values
      switch (roleValue) {
        case 'student':
        case 'estudante':
        case 'aluno':
          return UserRole.STUDENT;
        case 'tutor':
        case 'professor':
          return UserRole.TUTOR;
        case 'admin':
        case 'administrator':
        case 'administrador':
          return UserRole.LOCAL_ADMIN;
        case 'content_manager':
        case 'gestor':
        case 'gestor_conteudo':
          return UserRole.CONTENT_MANAGER;
        default:
          return UserRole.STUDENT; // Default fallback
      }
    }

    // Default to STUDENT if no role specified
    return UserRole.STUDENT;
  }
}
