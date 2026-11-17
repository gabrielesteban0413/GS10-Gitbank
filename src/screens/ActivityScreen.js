import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FocusGlow from '../components/FocusGlow';
import { useBanking } from '../state/BankingContext';
import { colors } from '../theme/colors';
import { formatMoney } from '../utils/formatMoney';

const filters = ['Todo', 'Ingresos', 'Gastos'];

function transactionIcon(transaction) {
  if (transaction.amount > 0) return 'arrow-down-outline';
  if (transaction.category === 'Ahorro') return 'airplane-outline';
  if (transaction.category === 'Compras') return 'cart-outline';
  if (transaction.category === 'Restaurantes') return 'cafe-outline';
  return 'arrow-up-outline';
}

export default function ActivityScreen() {
  const { transactions } = useBanking();
  const [filter, setFilter] = useState('Todo');
  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    if (filter === 'Ingresos') return transaction.amount > 0;
    if (filter === 'Gastos') return transaction.amount < 0 && transaction.category !== 'Ahorro';
    return true;
  }), [filter, transactions]);
  const expenses = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.category !== 'Ahorro')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>TUS FINANZAS</Text>
        <Text style={styles.title}>Actividad</Text>
        <Text style={styles.subtitle}>Un resumen claro de tus movimientos recientes.</Text>
      </View>

      <View style={styles.monthCard}>
        <FocusGlow color={colors.primary} size={126} style={styles.monthGlow} />
        <View style={styles.monthIcon}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.monthCopy}>
          <Text style={styles.monthLabel}>Gastos registrados</Text>
          <Text style={styles.monthPeriod}>Este mes · Cuenta principal</Text>
        </View>
        <Text style={styles.monthAmount}>{formatMoney(expenses)}</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item }}
            onPress={() => setFilter(item)}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.listHeading}>Movimientos</Text>
      {filteredTransactions.length ? (
        <View style={styles.transactionList}>
          {filteredTransactions.map((transaction, index) => {
            const income = transaction.amount > 0;
            return (
              <View key={transaction.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.transactionRow}>
                  <View style={[styles.transactionIcon, income ? styles.incomeIcon : styles.expenseIcon]}>
                    <Ionicons
                      name={transactionIcon(transaction)}
                      size={19}
                      color={income ? colors.success : colors.primary}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionMeta}>{transaction.category} · {transaction.date}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, income && styles.incomeAmount]}>
                    {income ? '+' : '-'}{formatMoney(Math.abs(transaction.amount))}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>No hay movimientos en esta categoría todavía.</Text>
        </View>
      )}

      <View style={styles.demoNotice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.demoNoticeText}>Movimientos de ejemplo almacenados solo durante esta sesión.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  heading: { marginBottom: 19 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 7 },
  title: { color: colors.primaryDark, fontSize: 27, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 5 },
  monthCard: { position: 'relative', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceRaised, borderRadius: 18, padding: 15, marginBottom: 20 },
  monthGlow: { right: -32, top: -42 },
  monthIcon: { width: 41, height: 41, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, marginRight: 11 },
  monthCopy: { flex: 1 },
  monthLabel: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  monthPeriod: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  monthAmount: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 9, backgroundColor: colors.surfaceRaised, borderRadius: 18 },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  listHeading: { color: colors.primaryDark, fontSize: 15, fontWeight: '800', marginBottom: 11 },
  transactionList: { backgroundColor: colors.surfaceRaised, borderRadius: 20, paddingHorizontal: 15 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  transactionIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  incomeIcon: { backgroundColor: colors.successSoft },
  expenseIcon: { backgroundColor: colors.primarySoft },
  transactionInfo: { flex: 1 },
  transactionTitle: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  transactionMeta: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  transactionAmount: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  incomeAmount: { color: colors.success },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 53 },
  emptyState: { backgroundColor: colors.surfaceRaised, alignItems: 'center', padding: 28, borderRadius: 18 },
  emptyText: { color: colors.textMuted, fontSize: 11, marginTop: 10, textAlign: 'center' },
  demoNotice: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  demoNoticeText: { color: colors.textMuted, fontSize: 10, marginLeft: 6 },
});
