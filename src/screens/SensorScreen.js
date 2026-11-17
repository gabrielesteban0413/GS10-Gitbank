import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBanking } from '../state/BankingContext';
import { colors } from '../theme/colors';

export default function SensorScreen({ navigation }) {
  const { frozenCards, toggleCardFrozen } = useBanking();
  const physicalCardFrozen = Boolean(frozenCards.physical);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>PROTECCIÓN DE CUENTA</Text>
        <Text style={styles.title}>Seguridad</Text>
        <Text style={styles.subtitle}>Controles rápidos para proteger tus tarjetas y tu privacidad.</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <Ionicons name="shield-checkmark" size={27} color={colors.success} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Tu cuenta está protegida</Text>
          <Text style={styles.statusSubtitle}>Los controles de esta demo se aplican localmente.</Text>
        </View>
        <View style={styles.statusDot} />
      </View>

      <Text style={styles.sectionTitle}>Tarjetas</Text>
      <View style={styles.controlCard}>
        <View style={styles.controlRow}>
          <View style={styles.controlIcon}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.controlCopy}>
            <Text style={styles.controlTitle}>Gidbank Débito ···· 6986</Text>
            <Text style={styles.controlSubtitle}>
              {physicalCardFrozen ? 'Los pagos están pausados' : 'Pagos habilitados'}
            </Text>
          </View>
          <View style={[styles.statePill, physicalCardFrozen && styles.statePillFrozen]}>
            <Text style={[styles.stateText, physicalCardFrozen && styles.stateTextFrozen]}>
              {physicalCardFrozen ? 'CONGELADA' : 'ACTIVA'}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleCardFrozen('physical')}
          style={({ pressed }) => [styles.freezeButton, pressed && styles.pressed]}
        >
          <Ionicons
            name={physicalCardFrozen ? 'sunny-outline' : 'snow-outline'}
            size={17}
            color={physicalCardFrozen ? colors.success : colors.primary}
          />
          <Text style={[styles.freezeText, physicalCardFrozen && styles.unfreezeText]}>
            {physicalCardFrozen ? 'Descongelar tarjeta' : 'Congelar tarjeta'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Privacidad</Text>
      <View style={styles.privacyCard}>
        <View style={styles.privacyIcon}>
          <Ionicons name="eye-off-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.privacyTitle}>Oculta tu saldo al instante</Text>
        <Text style={styles.privacyDescription}>
          En Inicio, agita el teléfono para ocultar el saldo. También puedes tocar el icono del ojo.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Inicio')}
          style={styles.privacyAction}
        >
          <Text style={styles.privacyActionText}>Ir a Inicio</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.noticeText}>
          Gidbank es un prototipo: no sustituye los controles de seguridad de una entidad bancaria.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  heading: { marginBottom: 20 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 7 },
  title: { color: colors.primaryDark, fontSize: 27, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successSoft, borderRadius: 18, padding: 15, marginBottom: 23 },
  statusIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: '#1C493A', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  statusCopy: { flex: 1 },
  statusTitle: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  statusSubtitle: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  sectionTitle: { color: colors.primaryDark, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  controlCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 15, marginBottom: 22 },
  controlRow: { flexDirection: 'row', alignItems: 'center' },
  controlIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  controlCopy: { flex: 1 },
  controlTitle: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  controlSubtitle: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  statePill: { backgroundColor: colors.successSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  statePillFrozen: { backgroundColor: colors.warningSoft },
  stateText: { color: colors.success, fontSize: 8, fontWeight: '800' },
  stateTextFrozen: { color: colors.warning },
  freezeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, paddingVertical: 11, borderRadius: 13, marginTop: 14 },
  freezeText: { color: colors.primary, fontSize: 10, fontWeight: '800', marginLeft: 7 },
  unfreezeText: { color: colors.success },
  pressed: { opacity: 0.72 },
  privacyCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 16 },
  privacyIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  privacyTitle: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  privacyDescription: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  privacyAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 13 },
  privacyActionText: { color: colors.primary, fontSize: 10, fontWeight: '800', marginRight: 5 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 19, paddingHorizontal: 2 },
  noticeText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginLeft: 6, flex: 1 },
});
