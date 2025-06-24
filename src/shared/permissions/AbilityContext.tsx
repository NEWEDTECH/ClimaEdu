'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createContextualCan } from '@casl/react';
import { AnyAbility } from '@casl/ability';
import { AppAbility, Role, createAppAbility } from './types';

const AbilityContext = createContext<AppAbility>(createAppAbility({ role: Role.STUDENT }));

export const Can = createContextualCan(AbilityContext.Consumer as React.Consumer<AnyAbility>);

interface AbilityProviderProps {
  children: React.ReactNode;
  role: Role;
  institutionId?: string;
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({
  children,
  role,
  institutionId,
}) => {
  const [ability, setAbility] = useState<AppAbility>(() =>
    createAppAbility({ role, institutionId })
  );

  useEffect(() => {
    setAbility(createAppAbility({ role, institutionId }));
  }, [role, institutionId]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};


export const useAbility = (): AppAbility => {
  const ability = useContext(AbilityContext);
  return ability;
};
