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
    const { csvData, institutionId, createdByUserId, createdByUserRole, onProgress } = input;
    
    // Validate CSV structure
    this.validateCSVStructure(csvData);

    const createdUsers: User[] = [];
    const failedEmails: Array<{ email: string; error: string }> = [];

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        const emailValue = this.extractEmailFromRow(row);
        
        console.log(`🔄 Processing user ${i + 1}/${csvData.length}: ${emailValue}`);
        
        if (!emailValue || emailValue.trim() === '') {
          failedEmails.push({
            email: 'empty',
            error: 'Email is empty or missing'
          });
          
          // Update progress after processing
          if (onProgress) {
            console.log(`📊 Progress update: ${i + 1}/${csvData.length} - ${emailValue || 'email vazio'}`);
            onProgress(i + 1, csvData.length, emailValue || 'email vazio');
          }
          continue;
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(emailValue);
        if (existingUser) {
          failedEmails.push({
            email: emailValue,
            error: 'User with this email already exists'
          });
          
          // Update progress after processing
          if (onProgress) {
            console.log(`📊 Progress update: ${i + 1}/${csvData.length} - ${emailValue} (já existe)`);
            onProgress(i + 1, csvData.length, `${emailValue} (já existe)`);
          }
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
        
        console.log(`✅ User created successfully: ${emailValue}`);

      } catch (error) {
        const emailValue = this.extractEmailFromRow(row) || 'unknown';
        failedEmails.push({
          email: emailValue,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        
        console.log(`❌ Error creating user: ${emailValue} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Always update progress after each row is processed
      if (onProgress) {
        const emailValue = this.extractEmailFromRow(row) || 'processando...';
        console.log(`📊 Final progress update: ${i + 1}/${csvData.length} - ${emailValue}`);
        onProgress(i + 1, csvData.length, emailValue);
      }
    }

    // Analyze results and provide specific error messages
    const result = {
      createdUsers,
      failedEmails,
      totalProcessed: csvData.length,
      totalCreated: createdUsers.length,
      totalFailed: failedEmails.length
    };

    // If no users were created, provide specific error message
    if (result.totalCreated === 0 && result.failedEmails.length > 0) {
      const allExistingUsers = result.failedEmails.every(failure => 
        failure.error.toLowerCase().includes('already exists')
      );
      
      if (allExistingUsers) {
        throw new Error('Todos os usuários já existem na plataforma.');
      }
    }

    return result;
  }

  /**
   * Validate CSV structure and required columns
   */
  private validateCSVStructure(csvData: Array<Record<string, string>>): void {
    if (csvData.length === 0) {
      throw new Error('CSV data is empty');
    }

    const firstRow = csvData[0];
    const originalColumns = Object.keys(firstRow);
    const columns = originalColumns.map(key => key.toLowerCase().trim().replace(/\s+/g, ''));

    console.log('🔍 Original CSV columns:', originalColumns);
    console.log('🔍 Normalized CSV columns:', columns);

    // Check for required columns: nome, email, tipo (more flexible matching)
    const hasNome = columns.some(col => 
      col === 'nome' || col === 'name' || col.includes('nome') || col.includes('name')
    );
    const hasEmail = columns.some(col => 
      col === 'email' || col.includes('email') || col.includes('e-mail')
    );
    const hasTipo = columns.some(col => 
      col === 'tipo' || col === 'type' || col === 'role' || 
      col.includes('tipo') || col.includes('type') || col.includes('role')
    );

    console.log('📋 Column validation:', { hasNome, hasEmail, hasTipo });

    const missingColumns: string[] = [];
    if (!hasNome) missingColumns.push('nome');
    if (!hasEmail) missingColumns.push('email');
    if (!hasTipo) missingColumns.push('tipo');

    if (missingColumns.length > 0) {
      console.error('❌ Missing columns. Available columns:', originalColumns);
      throw new Error(`CSV deve conter as colunas: ${missingColumns.join(', ')}. Colunas encontradas: ${originalColumns.join(', ')}`);
    }

    console.log('✅ CSV validation passed!');
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
