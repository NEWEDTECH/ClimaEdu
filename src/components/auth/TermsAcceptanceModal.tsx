'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { container } from '@/_core/shared/container/container';
import { Register } from '@/_core/shared/container/symbols';
import type { AuthService } from '@/_core/modules/auth/infrastructure/services/AuthService';
import { acceptTerms } from '@/_core/modules/user/infrastructure/repositories/termsAcceptanceService';
import { LEGAL_DOCUMENTS, TERMS_VERSION, type LegalDocument } from '@/content/legal';

interface TermsAcceptanceModalProps {
  userId: string;
  role: string | null;
  /** Exibe (e exige) o aceite específico de Professores e Criadores de Conteúdo */
  requireTeacherTerms: boolean;
  onAccepted: () => void;
}

/**
 * Uma linha é título de seção quando está toda em maiúsculas
 * (ex.: "1. DEFINIÇÕES", "A. TERMO DE ACEITE — ALUNOS", "REGISTRO DO ACEITE").
 */
function isSectionHeading(line: string): boolean {
  const letters = line.replace(/[^A-Za-zÀ-ÿ]/g, '');
  return letters.length >= 3 && letters === letters.toUpperCase() && line.length <= 120;
}

/** Renderiza o texto (uma linha = um parágrafo; #, ##, - e títulos em maiúsculas). */
function LegalText({ content }: { content: string }) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  // Agrupa itens "- " consecutivos numa lista
  const blocks: Array<{ kind: 'line'; text: string } | { kind: 'list'; items: string[] }> = [];
  for (const line of lines) {
    if (line.startsWith('- ')) {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'list') last.items.push(line.slice(2));
      else blocks.push({ kind: 'list', items: [line.slice(2)] });
    } else {
      blocks.push({ kind: 'line', text: line });
    }
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {blocks.map((block, i) => {
        if (block.kind === 'list') {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {block.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          );
        }

        const { text } = block;

        if (text.startsWith('# ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-gray-900 dark:text-white">
              {text.slice(2)}
            </h3>
          );
        }

        if (text.startsWith('## ') || isSectionHeading(text)) {
          return (
            <h4 key={i} className="font-semibold text-gray-900 dark:text-gray-100 pt-3">
              {text.startsWith('## ') ? text.slice(3) : text}
            </h4>
          );
        }

        return <p key={i}>{text}</p>;
      })}
    </div>
  );
}

type CheckboxId = LegalDocument['id'] | 'professor';

/**
 * Caixas de aceite exibidas no rodapé do modal (uma por documento + a de Professor).
 * `link` é o trecho do texto que vira botão para abrir a aba do documento.
 */
const ACCEPTANCE_CHECKBOXES: Array<{
  id: CheckboxId;
  tab: LegalDocument['id'];
  before: string;
  link: string;
  after: string;
}> = [
  {
    id: 'termos-de-uso',
    tab: 'termos-de-uso',
    before: 'Li e aceito os ',
    link: 'Termos de Uso',
    after: '.',
  },
  {
    id: 'termos-de-aceite',
    tab: 'termos-de-aceite',
    before: 'Li e concordo com as declarações do ',
    link: 'Termo de Aceite',
    after: '.',
  },
  {
    id: 'politica-de-privacidade',
    tab: 'politica-de-privacidade',
    before: 'Li e aceito a ',
    link: 'Política de Privacidade',
    after: ' e autorizo o tratamento dos meus dados pessoais nos termos nela descritos.',
  },
  {
    id: 'professor',
    tab: 'termos-de-aceite',
    before: 'Li e aceito as ',
    link: 'condições específicas para Professores e Criadores de Conteúdo',
    after: ', previstas na Cláusula 6ª dos Termos de Uso.',
  },
];

export function TermsAcceptanceModal({ userId, role, requireTeacherTerms, onAccepted }: TermsAcceptanceModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(LEGAL_DOCUMENTS[0].id);
  const [checks, setChecks] = useState<Record<CheckboxId, boolean>>({
    'termos-de-uso': false,
    'termos-de-aceite': false,
    'politica-de-privacidade': false,
    professor: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleCheckboxes = ACCEPTANCE_CHECKBOXES.filter(c => c.id !== 'professor' || requireTeacherTerms);
  const canAccept = visibleCheckboxes.every(c => checks[c.id]);

  const activeDocument = LEGAL_DOCUMENTS.find(d => d.id === activeTab) ?? LEGAL_DOCUMENTS[0];

  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await acceptTerms(userId, TERMS_VERSION, {
        termsOfUseAccepted: checks['termos-de-uso'],
        acceptanceTermAccepted: checks['termos-de-aceite'],
        privacyPolicyAccepted: checks['politica-de-privacidade'],
        teacherTermsAccepted: requireTeacherTerms && checks.professor,
        role,
      });
      onAccepted();
    } catch (err) {
      console.error('Error saving terms acceptance:', err);
      setError('Não foi possível registrar o aceite. Tente novamente.');
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const authService = container.get<AuthService>(Register.auth.service.AuthService);
      await authService.signOut();
    } finally {
      router.push('/login');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="terms-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
                Antes de continuar
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Leia e aceite os termos abaixo para acessar a plataforma.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto" role="tablist">
            {LEGAL_DOCUMENTS.map(d => (
              <button
                key={d.id}
                role="tab"
                aria-selected={activeTab === d.id}
                onClick={() => setActiveTab(d.id)}
                className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === d.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin" role="tabpanel">
          <LegalText content={activeDocument.content} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="space-y-2">
            {visibleCheckboxes.map(c => (
              <label key={c.id} className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checks[c.id]}
                  onChange={e => setChecks(prev => ({ ...prev, [c.id]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {c.before}
                  <button
                    type="button"
                    onClick={e => {
                      // Abre a aba do documento sem marcar/desmarcar a caixa
                      e.preventDefault();
                      setActiveTab(c.tab);
                    }}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {c.link}
                  </button>
                  {c.after}
                </span>
              </label>
            ))}
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleLogout}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
            >
              Recusar e sair
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept || submitting}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registrando...' : 'Aceitar e continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
