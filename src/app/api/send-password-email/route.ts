import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * POST /api/send-password-email
 * Envia a senha temporária gerada pelo Firebase para o email do usuário
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password, userName } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Get email configuration from environment variables
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      fromName: process.env.EMAIL_FROM_NAME || 'ClimaEdu',
      fromAddress: process.env.EMAIL_FROM_ADDRESS,
    };

    // Validate email configuration
    if (!emailConfig.host || !emailConfig.user || !emailConfig.password || !emailConfig.fromAddress) {
      console.error('Email configuration is incomplete');
      return NextResponse.json(
        { error: 'Configuração de email incompleta no servidor' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465, // true for 465, false for other ports
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Compose email
    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromAddress}>`,
      to: email,
      subject: 'Sua senha de acesso - ClimaEdu',
      text: `
        ${userName ? `Olá, ${userName}!\n\n` : ''}Sua conta foi criada com sucesso na plataforma ClimaEdu.
        
        Sua senha temporária de acesso é: ${password}
        
        Email de acesso: ${email}
        
        IMPORTANTE: Por questões de segurança, recomendamos que você altere esta senha após o primeiro acesso.
        
        Se você não solicitou esta conta, por favor ignore este email.
        
        © ${new Date().getFullYear()} ClimaEdu. Todos os direitos reservados.
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return NextResponse.json(
      {
        success: true,
        message: 'Email enviado com sucesso',
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    // Handle specific nodemailer errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'Credenciais de email inválidas. Verifique EMAIL_USER e EMAIL_PASSWORD' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Falha ao enviar email: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Falha ao enviar email' },
      { status: 500 }
    );
  }
}
