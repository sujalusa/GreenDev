'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, DeploymentConfig, AnalysisResult } from '@/types';

const initialState: AppState = {
  repoUrl: '',
  deploymentConfig: {},
  scanResult: null,
  scanId: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload };
    case 'SET_DEPLOYMENT_CONFIG':
      return { ...state, deploymentConfig: { ...state.deploymentConfig, ...action.payload } };
    case 'SET_SCAN_RESULT':
      return { ...state, scanResult: action.payload, scanId: action.payload.scanId };
    case 'SET_SCAN_ID':
      return { ...state, scanId: action.payload };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

const AppStateContext = createContext<AppState | null>(null);
const AppDispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}
