import { injectable } from 'inversify';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface GeneratePdfInput {
  studentName: string;
  courseName: string;
  institutionName: string;
  instructorName?: string;
  hoursCompleted?: number;
  grade?: number;
  issueDate: string;
  certificateNumber?: string;
}

@injectable()
export class PdfGeneratorService {
  private readonly templatePath = join(process.cwd(), 'src/app/api/certificates/templates/certificate-template.html');

  async generateCertificatePdf(input: GeneratePdfInput): Promise<Buffer> {
    let browser;
    
    try {
      // Configure chromium for serverless environments
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;
      
      // Chrome arguments for serverless environment
      const chromeArgs = [
        '--font-render-hinting=none',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-animations',
        '--disable-background-timer-throttling',
        '--disable-restore-session-state',
        '--disable-web-security',
        '--single-process'
      ];
      
      // Read the HTML template
      const templateHtml = await readFile(this.templatePath, 'utf-8');
      
      // Replace placeholders with actual data
      const html = this.replacePlaceholders(templateHtml, input);
      
      // Launch Puppeteer browser with Vercel-compatible configuration
      browser = await puppeteer.launch({
        args: chromeArgs,
        executablePath: await chromium.executablePath(),
        ignoreHTTPSErrors: true,
        headless: true,
      });
      
      const page = await browser.newPage();
      
      // Set media type for print
      await page.emulateMediaType('print');
      
      // Set content and wait for it to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        omitBackground: false,
        margin: {
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
        },
        preferCSSPageSize: true,
      });
      
      // Close pages properly for serverless environment
      const pages = await browser.pages();
      for (const openPage of pages) {
        await openPage.close();
      }
      
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate certificate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  private replacePlaceholders(template: string, input: GeneratePdfInput): string {
    return template
      .replace(/\{\{studentName\}\}/g, input.studentName)
      .replace(/\{\{courseName\}\}/g, input.courseName)
      .replace(/\{\{institutionName\}\}/g, input.institutionName)
      .replace(/\{\{instructorName\}\}/g, input.instructorName || 'Instrutor do Curso')
      .replace(/\{\{hoursCompleted\}\}/g, String(input.hoursCompleted || 40))
      .replace(/\{\{grade\}\}/g, String(input.grade || 85))
      .replace(/\{\{issueDate\}\}/g, input.issueDate)
      .replace(/\{\{certificateNumber\}\}/g, input.certificateNumber || '');
  }
}