'use client';

import { createContext, useContext } from 'react';
import type { HostInstitution } from '@/_core/modules/institution/infrastructure/server/host-institution';

type HostInstitutionContextValue = {
  /** Institution resolved by the current domain (null on the platform domain) */
  institution: HostInstitution | null;
};

const HostInstitutionContext = createContext<HostInstitutionContextValue>({ institution: null });

export function HostInstitutionProvider({
  institution,
  children,
}: {
  institution: HostInstitution | null;
  children: React.ReactNode;
}) {
  return (
    <HostInstitutionContext.Provider value={{ institution }}>
      {children}
    </HostInstitutionContext.Provider>
  );
}

export function useHostInstitution() {
  return useContext(HostInstitutionContext);
}
