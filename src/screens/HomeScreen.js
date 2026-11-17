import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import useAccelerometer from '../hooks/useAccelerometer';
import FocusGlow from '../components/FocusGlow';
import { useBanking } from '../state/BankingContext';
import { colors } from '../theme/colors';
import { formatMoney } from '../utils/formatMoney';

const shortcuts = [
  { label: 'Transferir', icon: 'swap-horizontal-outline', route: 'Transferir' },
  { label: 'Tarjetas', icon: 'card-outline', route: 'Tarjetas' },
  { label: 'Pagar QR', icon: 'scan-outline', route: 'Escáner QR' },
  { label: 'Seguridad', icon: 'shield-checkmark-outline', route: 'Seguridad' },
];

function formatTransactionAmount(amount) {
  return `${amount > 0 ? '+' : '-'}${formatMoney(Math.abs(amount))}`;
}

export default function HomeScreen({ navigation }) {
  const { balance, travelSavings, transactions, frozenCards } = useBanking();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [privacyMessage, setPrivacyMessage] = useState(false);
  const isFocused = useIsFocused();
  const { available, magnitude } = useAccelerometer(120, isFocused);
  const lastShake = useRef(0);
  const privacyTimer = useRef(null);
  const privacyIconRotation = useSharedValue(0);
  const privacyIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${privacyIconRotation.value}deg` }],
  }));

  useEffect(() => {
    if (!available || magnitude <= 2.5 || Date.now() - lastShake.current < 1500) return;

    lastShake.current = Date.now();
    setBalanceVisible(false);
    setPrivacyMessage(true);
    privacyIconRotation.value = withSequence(
      withRepeat(withTiming(8, { duration: 70 }), 4, true),
      withSpring(0),
    );

    if (privacyTimer.current) clearTimeout(privacyTimer.current);
    privacyTimer.current = setTimeout(() => setPrivacyMessage(false), 2500);
  }, [available, magnitude, privacyIconRotation]);

  useEffect(() => () => {
    if (privacyTimer.current) clearTimeout(privacyTimer.current);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú de navegación"
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Ionicons name="menu-outline" size={25} color={colors.primaryDark} />
        </Pressable>
        <View style={styles.brandCopy}>
          <Text style={styles.brand}>Gidbank</Text>
          <Text style={styles.greeting}>Hola, Gabriel</Text>
        </View>
        <Animated.View style={[styles.headerIcon, privacyIconStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
            onPress={() => setBalanceVisible((visible) => !visible)}
          >
            <Ionicons
              name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={21}
              color={colors.primaryDark}
            />
          </Pressable>
        </Animated.View>
        <Pressable style={styles.avatar} onPress={() => navigation.navigate('Perfil')}>
          <Text style={styles.avatarText}>G</Text>
        </Pressable>
      </View>

      <View style={styles.balanceCard}>
        <FocusGlow color={colors.primary} size={210} style={styles.balanceGlow} />
        <FocusGlow color={colors.accent} size={92} style={styles.balanceGlowSmall} />
        <View style={styles.balanceHeader}>
          <View>
            <Text style={styles.balanceLabel}>Saldo total</Text>
            <Text style={styles.accountLabel}>Cuenta principal · USD</Text>
          </View>
          <View style={styles.accountStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ACTIVA</Text>
          </View>
        </View>
        <Text style={styles.balanceAmount}>
          {balanceVisible ? formatMoney(balance) : '$ ••••••••'}
        </Text>
        <View style={styles.balanceFooter}>
          <Text style={styles.accountNumber}>••••  ••••  ••••  6986</Text>
          <Ionicons name="wifi-outline" size={21} color="#B5B4C7" />
        </View>
        <View style={styles.cardOrb} />
        <View style={styles.cardOrbSmall} />
      </View>

      {privacyMessage && (
        <View style={styles.privacyNotice}>
          <Ionicons name="lock-closed" size={16} color={colors.success} />
          <Text style={styles.privacyText}>Saldo oculto para proteger tu privacidad.</Text>
        </View>
      )}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <Pressable onPress={() => navigation.openDrawer()}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </Pressable>
      </View>
      <View style={styles.shortcuts}>
        {shortcuts.map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.shortcutIcon}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.cardPreview} onPress={() => navigation.navigate('Tarjetas')}>
        <View style={styles.cardPreviewCopy}>
          <View style={styles.cardTag}>
            <Ionicons name="card-outline" size={15} color={colors.primary} />
            <Text style={styles.cardTagText}>TU TARJETA</Text>
          </View>
          <Text style={styles.cardPreviewTitle}>
            {frozenCards.physical ? 'Tarjeta congelada' : 'Lista para usar'}
          </Text>
          <Text style={styles.cardPreviewDetail}>•••• 6986  ·  Débito</Text>
        </View>
        <View style={styles.miniCard}>
          <View style={styles.miniCardChip} />
          <Text style={styles.miniCardBrand}>N</Text>
        </View>
      </Pressable>

      <View style={styles.savingsCard}>
        <FocusGlow color={colors.success} size={106} style={styles.savingsGlow} />
        <View style={styles.savingsIcon}>
          <Ionicons name="airplane-outline" size={18} color={colors.success} />
        </View>
        <View style={styles.savingsCopy}>
          <Text style={styles.savingsTitle}>Bolsillo Viaje</Text>
          <Text style={styles.savingsSubtitle}>Tu próximo destino, más cerca</Text>
        </View>
        <View style={styles.savingsAmount}>
          <Text style={styles.savingsValue}>{balanceVisible ? formatMoney(travelSavings) : '••••••'}</Text>
          <Text style={styles.savingsLabel}>AHORRADO</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <Pressable onPress={() => navigation.navigate('Actividad')}>
          <Text style={styles.seeAll}>Ver movimientos</Text>
        </Pressable>
      </View>
      <View style={styles.transactionCard}>
        {transactions.slice(0, 3).map((transaction, index) => (
          <View key={transaction.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.transactionRow}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.amount > 0 ? colors.successSoft : colors.primarySoft }]}>
                <Ionicons
                  name={transaction.amount > 0 ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={19}
                  color={transaction.amount > 0 ? colors.success : colors.primary}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, transaction.amount > 0 && styles.income]}>
                {formatTransactionAmount(transaction.amount)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.demoNote}>
        <Ionicons name="information-circle-outline" size={17} color={colors.textMuted} />
        <Text style={styles.demoNoteText}>Experiencia de demostración. No se realizan operaciones bancarias reales.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  menuButton: {
    width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 14, marginRight: 12,
  },
  brandCopy: { flex: 1 },
  brand: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  greeting: { color: colors.primaryDark, fontSize: 18, fontWeight: '800', marginTop: 2 },
  headerIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  balanceCard: {
    position: 'relative',
    backgroundColor: '#17152B', borderRadius: 25, padding: 22, minHeight: 187,
    marginBottom: 19, overflow: 'hidden',
  },
  balanceGlow: { right: -74, top: -78 },
  balanceGlowSmall: { right: 46, bottom: -48 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { color: '#C9C8D4', fontSize: 13, fontWeight: '600' },
  accountLabel: { color: '#858594', fontSize: 11, marginTop: 4 },
  accountStatus: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20,
    paddingHorizontal: 9, paddingVertical: 6, backgroundColor: 'rgba(200,244,106,0.12)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: 5 },
  statusText: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  balanceAmount: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', letterSpacing: -0.8, marginTop: 21 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  accountNumber: { color: '#B5B4C7', fontSize: 12, letterSpacing: 1.2 },
  cardOrb: {
    width: 130, height: 130, borderRadius: 65, position: 'absolute',
    right: -66, top: 62, backgroundColor: 'rgba(102,88,232,0.19)',
  },
  cardOrbSmall: {
    width: 74, height: 74, borderRadius: 37, position: 'absolute',
    right: 12, top: 95, backgroundColor: 'rgba(200,244,106,0.08)',
  },
  privacyNotice: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successSoft,
    padding: 12, marginBottom: 18, borderRadius: 12,
  },
  privacyText: { color: colors.success, fontSize: 11, fontWeight: '700', marginLeft: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: colors.primaryDark, fontSize: 16, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  shortcut: { alignItems: 'center', width: '23%' },
  shortcutIcon: {
    width: 56, height: 56, borderRadius: 19, backgroundColor: colors.surfaceRaised,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  shortcutLabel: { color: colors.text, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.7 },
  cardPreview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 17, borderRadius: 20, backgroundColor: colors.surfaceRaised, marginBottom: 13,
  },
  cardPreviewCopy: { flex: 1 },
  cardTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  cardTagText: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginLeft: 6 },
  cardPreviewTitle: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  cardPreviewDetail: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  miniCard: {
    width: 72, height: 48, borderRadius: 10, backgroundColor: colors.primary,
    padding: 8, justifyContent: 'space-between',
  },
  miniCardChip: { width: 12, height: 9, borderRadius: 3, backgroundColor: colors.accent },
  miniCardBrand: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', alignSelf: 'flex-end' },
  savingsCard: {
    position: 'relative',
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 18, padding: 15, marginBottom: 25, overflow: 'hidden',
  },
  savingsGlow: { right: 34, top: -38 },
  savingsIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  savingsCopy: { flex: 1, marginLeft: 11 },
  savingsTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  savingsSubtitle: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  savingsAmount: { alignItems: 'flex-end' },
  savingsValue: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  savingsLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.6, marginTop: 3 },
  transactionCard: { backgroundColor: colors.surfaceRaised, borderRadius: 20, paddingHorizontal: 15, marginBottom: 17 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  transactionIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  transactionInfo: { flex: 1 },
  transactionTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  transactionDate: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  transactionAmount: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  income: { color: colors.success },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 53 },
  demoNote: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2 },
  demoNoteText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, flex: 1, marginLeft: 6 },
});
