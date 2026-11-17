import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import FocusGlow from '../components/FocusGlow';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useBanking } from '../state/BankingContext';
import { colors } from '../theme/colors';
import { formatMoney } from '../utils/formatMoney';

const transferAmounts = [25, 50, 100];

function DragMoneyToken({ amount, prepared, onDrop }) {
  const translationX = useSharedValue(0);
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translationX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > 70) {
        translationX.value = withSpring(95, { damping: 14 });
        runOnJS(onDrop)();
      } else {
        translationX.value = withSpring(0, { damping: 14 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { rotate: `${Math.max(-18, Math.min(18, translationX.value * 0.12))}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityLabel={`Arrastra ${formatMoney(amount)} al Bolsillo Viaje`}
        style={[styles.moneyToken, prepared && styles.moneyTokenPrepared, animatedStyle]}
      >
        <Ionicons name={prepared ? 'checkmark' : 'arrow-forward'} size={17} color={colors.background} />
        <Text style={styles.moneyTokenAmount}>{formatMoney(amount)}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function TransferProgress({ onComplete }) {
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 900 }), -1, false);
    progress.value = withTiming(1, { duration: 1800 }, (finished) => {
      if (finished) runOnJS(onComplete)();
    });

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(progress);
    };
  }, [onComplete, progress, rotation]);

  return (
    <View style={styles.progressContent}>
      <Animated.View style={[styles.spinner, spinnerStyle]}>
        <View style={styles.spinnerDot} />
      </Animated.View>
      <Text style={styles.progressTitle}>Moviendo tu dinero</Text>
      <Text style={styles.progressText}>Estamos actualizando tus saldos.</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
      <Text style={styles.secureLabel}>
        <Ionicons name="lock-closed" size={12} color={colors.success} />
        {'  '}Operación segura · Datos de demostración
      </Text>
    </View>
  );
}

export default function TransferScreen({ navigation }) {
  const { balance, travelSavings, moveToTravelPocket } = useBanking();
  const [amount, setAmount] = useState(25);
  const [prepared, setPrepared] = useState(false);
  const [phase, setPhase] = useState('ready');

  const completeTransfer = useCallback(() => {
    moveToTravelPocket(amount);
    setPhase('complete');
  }, [amount, moveToTravelPocket]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <View style={styles.eyebrow}>
          <Ionicons name="swap-horizontal-outline" size={14} color={colors.primary} />
          <Text style={styles.eyebrowText}>TRANSFERENCIA ENTRE TUS CUENTAS</Text>
        </View>
        <Text style={styles.title}>
          {phase === 'complete' ? '¡Listo, transferido!' : 'Añade a tu bolsillo'}
        </Text>
        <Text style={styles.subtitle}>
          {phase === 'complete'
            ? 'El dinero ya está en tu Bolsillo Viaje.'
            : 'Mueve dinero a tus ahorros con un gesto.'}
        </Text>
      </View>

      {phase === 'ready' && (
        <>
          <Text style={styles.sectionTitle}>Elige el importe</Text>
          <View style={styles.amountOptions}>
            {transferAmounts.map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: amount === value, disabled: value > balance }}
                disabled={value > balance}
                onPress={() => {
                  setAmount(value);
                  setPrepared(false);
                }}
                style={[
                  styles.amountOption,
                  amount === value && styles.amountOptionSelected,
                  value > balance && styles.amountOptionDisabled,
                ]}
              >
                <Text style={[styles.amountOptionText, amount === value && styles.amountOptionTextSelected]}>
                  {formatMoney(value)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.transferStage}>
            <FocusGlow color={colors.primary} size={170} style={styles.transferGlow} />
            <FocusGlow color={colors.success} size={82} style={styles.transferGlowSmall} />
            <View style={styles.accountsRow}>
              <View style={styles.accountTile}>
                <View style={styles.accountIcon}>
                  <Ionicons name="card-outline" size={19} color={colors.primary} />
                </View>
                <Text style={styles.accountTileLabel}>Desde</Text>
                <Text style={styles.accountTileName}>Cuenta principal</Text>
                <Text style={styles.accountTileBalance}>{formatMoney(balance)}</Text>
              </View>

              <View style={styles.accountTile}>
                <View style={[styles.accountIcon, styles.savingsAccountIcon]}>
                  <Ionicons name="airplane-outline" size={19} color={colors.success} />
                </View>
                <Text style={styles.accountTileLabel}>Hacia</Text>
                <Text style={styles.accountTileName}>Bolsillo Viaje</Text>
                <Text style={styles.accountTileBalance}>{formatMoney(travelSavings)}</Text>
              </View>
            </View>

            <View style={styles.transferPath}>
              <View style={styles.pathLine} />
              <View style={[styles.targetHalo, prepared && styles.targetHaloReady]}>
                <Ionicons
                  name={prepared ? 'checkmark' : 'arrow-forward'}
                  size={15}
                  color={prepared ? colors.success : colors.textMuted}
                />
              </View>
            </View>

            <DragMoneyToken amount={amount} prepared={prepared} onDrop={() => setPrepared(true)} />
            <Text style={styles.dragHint}>
              {prepared ? 'Importe preparado para transferir' : 'Arrastra el importe hasta el bolsillo'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!prepared || amount > balance}
            onPress={() => setPhase('processing')}
            style={({ pressed }) => [
              styles.confirmButton,
              (!prepared || amount > balance) && styles.confirmButtonDisabled,
              pressed && prepared && styles.confirmButtonPressed,
            ]}
          >
            <Text style={styles.confirmText}>Confirmar movimiento</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </>
      )}

      {phase === 'processing' && <TransferProgress onComplete={completeTransfer} />}

      {phase === 'complete' && (
        <View style={styles.completeCard}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark" size={30} color={colors.success} />
          </View>
          <Text style={styles.completeAmount}>{formatMoney(amount)}</Text>
          <Text style={styles.completeCopy}>añadidos a Bolsillo Viaje</Text>
          <View style={styles.completeDivider} />
          <View style={styles.completeRow}>
            <Text style={styles.completeLabel}>Nuevo saldo del bolsillo</Text>
            <Text style={styles.completeValue}>{formatMoney(travelSavings)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Inicio')}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>Volver al inicio</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.demoNotice}>
        <Ionicons name="information-circle-outline" size={17} color={colors.textMuted} />
        <Text style={styles.demoNoticeText}>
          Demostración local: no se envía dinero ni se conecta con una cuenta bancaria.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  heading: { marginBottom: 22 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  eyebrowText: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginLeft: 6 },
  title: { color: colors.primaryDark, fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  sectionTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: '800', marginBottom: 10 },
  amountOptions: { flexDirection: 'row', gap: 9, marginBottom: 18 },
  amountOption: { flex: 1, paddingVertical: 11, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center' },
  amountOptionSelected: { backgroundColor: colors.primary },
  amountOptionDisabled: { opacity: 0.4 },
  amountOptionText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  amountOptionTextSelected: { color: '#FFFFFF' },
  transferStage: {
    position: 'relative',
    height: 234, backgroundColor: colors.surface, borderRadius: 22,
    padding: 14, marginBottom: 16, overflow: 'hidden',
  },
  transferGlow: { right: -72, top: -82 },
  transferGlowSmall: { left: -45, bottom: -44 },
  accountsRow: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  accountTile: {
    width: '47%', padding: 11, borderRadius: 16, backgroundColor: colors.background,
    alignItems: 'flex-start', justifyContent: 'center',
  },
  accountIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  savingsAccountIcon: { backgroundColor: colors.successSoft },
  accountTileLabel: { color: colors.textMuted, fontSize: 9 },
  accountTileName: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', marginTop: 3 },
  accountTileBalance: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  transferPath: { position: 'absolute', top: '43%', left: '50%', width: 40, height: 28, alignItems: 'center', justifyContent: 'center' },
  pathLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.border },
  targetHalo: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  targetHaloReady: { borderColor: colors.success, backgroundColor: colors.successSoft },
  moneyToken: {
    position: 'absolute', top: 89, left: '50%', marginLeft: -48,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.accent, elevation: 5,
    shadowColor: colors.background, shadowOpacity: 0.35, shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },
  moneyTokenPrepared: { backgroundColor: colors.successSoft },
  moneyTokenAmount: { color: colors.background, fontSize: 10, fontWeight: '900' },
  dragHint: { color: colors.textMuted, fontSize: 9, textAlign: 'center', marginTop: 8 },
  confirmButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary, borderRadius: 15, paddingHorizontal: 17,
    minHeight: 52, marginBottom: 15,
  },
  confirmButtonDisabled: { opacity: 0.42 },
  confirmButtonPressed: { opacity: 0.82 },
  confirmText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  progressContent: {
    minHeight: 330, backgroundColor: colors.surface, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', padding: 25, marginBottom: 16,
  },
  spinner: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 4,
    borderColor: colors.primarySoft, borderTopColor: colors.primary,
    alignItems: 'center', justifyContent: 'flex-start', marginBottom: 21,
  },
  spinnerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: -4 },
  progressTitle: { color: colors.primaryDark, fontSize: 16, fontWeight: '800' },
  progressText: { color: colors.textMuted, fontSize: 11, marginTop: 7 },
  progressTrack: { width: '100%', height: 7, borderRadius: 7, backgroundColor: colors.primarySoft, marginTop: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 7 },
  secureLabel: { color: colors.textMuted, fontSize: 9, marginTop: 13 },
  completeCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 22, alignItems: 'center', marginBottom: 16 },
  completeIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  completeAmount: { color: colors.primaryDark, fontSize: 26, fontWeight: '800', marginTop: 16 },
  completeCopy: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  completeDivider: { width: '100%', height: 1, backgroundColor: colors.border, marginVertical: 18 },
  completeRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completeLabel: { color: colors.textMuted, fontSize: 11 },
  completeValue: { color: colors.success, fontSize: 12, fontWeight: '800' },
  doneButton: { width: '100%', alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: colors.primary, marginTop: 20 },
  doneText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  demoNotice: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 2 },
  demoNoticeText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15, marginLeft: 6 },
});
