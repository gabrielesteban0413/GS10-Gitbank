import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const BankingContext = createContext(null);

const initialTransactions = [
  { id: 'txn-1', title: 'Mercado Central', date: 'Hoy · 14:30', amount: -42.8, category: 'Compras' },
  { id: 'txn-2', title: 'De Ana Martínez', date: 'Hoy · 11:08', amount: 180, category: 'Transferencia' },
  { id: 'txn-3', title: 'Café Atelier', date: 'Ayer · 09:15', amount: -6.5, category: 'Restaurantes' },
];

export function BankingProvider({ children }) {
  const [balance, setBalance] = useState(12450);
  const [travelSavings, setTravelSavings] = useState(2450);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [frozenCards, setFrozenCards] = useState({});

  const moveToTravelPocket = useCallback((amount) => {
    setBalance((currentBalance) => currentBalance - amount);
    setTravelSavings((currentSavings) => currentSavings + amount);
    setTransactions((currentTransactions) => [
      {
        id: `txn-${Date.now()}`,
        title: 'Aporte a Bolsillo Viaje',
        date: 'Ahora',
        amount: -amount,
        category: 'Ahorro',
      },
      ...currentTransactions,
    ]);
  }, []);

  const toggleCardFrozen = useCallback((cardId) => {
    setFrozenCards((current) => ({ ...current, [cardId]: !current[cardId] }));
  }, []);

  const value = useMemo(() => ({
    balance,
    travelSavings,
    transactions,
    frozenCards,
    moveToTravelPocket,
    toggleCardFrozen,
  }), [balance, travelSavings, transactions, frozenCards, moveToTravelPocket, toggleCardFrozen]);

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>;
}

export function useBanking() {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking debe usarse dentro de BankingProvider.');
  }
  return context;
}
