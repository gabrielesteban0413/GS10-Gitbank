import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import FocusGlow from '../components/FocusGlow';
import { useBanking } from '../state/BankingContext';
import { colors } from '../theme/colors';
import { formatMoney } from '../utils/formatMoney';

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 72, 350);

const cards = [
  { id: 'physical', name: 'Gidbank Débito', category: 'CUENTA PRINCIPAL', lastFour: '6986', holder: 'GABRIEL BOADA', tone: '#252443', accent: colors.accent },
  { id: 'virtual', name: 'Gidbank Virtual', category: 'COMPRAS ONLINE', lastFour: '2914', holder: 'GABRIEL BOADA', tone: '#6658E8', accent: '#DAD5FF' },
  { id: 'travel', name: 'Gidbank Viajes', category: 'BOLSILLO VIAJE', lastFour: '0623', holder: 'GABRIEL BOADA', tone: '#237C68', accent: '#B9F0D8' },
];

function CardArtwork({ card, frozen }) {
  return (
    <>
      <View style={[styles.cardOrbLarge, { backgroundColor: `${card.accent}22` }]} />
      <View style={[styles.cardOrbSmall, { backgroundColor: `${card.accent}18` }]} />
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cardBrand}>Gidbank</Text>
          <Text style={styles.cardCategory}>{card.category}</Text>
        </View>
        {frozen ? (
          <View style={styles.frozenPill}>
            <Ionicons name="snow-outline" size={12} color="#FFFFFF" />
            <Text style={styles.frozenPillText}>CONGELADA</Text>
          </View>
        ) : (
          <Ionicons name="wifi-outline" size={22} color="rgba(255,255,255,0.8)" />
        )}
      </View>
      <View style={styles.chip}>
        <View style={styles.chipLineVertical} />
        <View style={styles.chipLineHorizontal} />
      </View>
      <Text style={styles.cardNumber}>••••  ••••  ••••  {card.lastFour}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.cardHolder}>{card.holder}</Text>
        <Text style={styles.cardInitial}>N</Text>
      </View>
    </>
  );
}

function CardSlide({ card, index, activeIndex, drag, frozen }) {
  const animatedStyle = useAnimatedStyle(() => {
    const position = index - activeIndex.value - drag.value / CARD_WIDTH;
    const distance = Math.abs(position);
    return {
      opacity: interpolate(distance, [0, 1, 2], [1, 0.65, 0], Extrapolation.CLAMP),
      zIndex: 10 - Math.round(distance),
      transform: [
        { translateX: position * CARD_WIDTH * 0.76 },
        { scale: interpolate(distance, [0, 1, 2], [1, 0.84, 0.7], Extrapolation.CLAMP) },
        { rotate: `${interpolate(position, [-1, 0, 1], [-8, 0, 8], Extrapolation.CLAMP)}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[styles.cardSlide, { width: CARD_WIDTH, backgroundColor: card.tone }, animatedStyle]}>
      <CardArtwork card={card} frozen={frozen} />
    </Animated.View>
  );
}

function BounceAction({ title, icon, onPress, variant = 'secondary' }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPressIn={() => {
        scale.value = withTiming(0.94, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 5, stiffness: 180 });
      }}
      onPress={onPress}
      style={styles.actionPressable}
    >
      <Animated.View style={[
        styles.actionButton,
        primary ? styles.actionButtonPrimary : styles.actionButtonSecondary,
        animatedStyle,
      ]}>
        <Ionicons name={icon} size={17} color={primary ? '#FFFFFF' : colors.primary} />
        <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

function CardBackArtwork({ card, frozen }) {
  return (
    <>
      <View style={styles.backStripe} />
      <Text style={styles.backBrand}>Gidbank</Text>
      <View style={styles.backDetailRow}>
        <Text style={styles.backDetailLabel}>TITULAR</Text>
        <Text style={styles.backDetailValue}>{card.holder}</Text>
      </View>
      <View style={styles.backDetailRow}>
        <Text style={styles.backDetailLabel}>NÚMERO</Text>
        <Text style={styles.backDetailValue}>••••  ••••  ••••  {card.lastFour}</Text>
      </View>
      <View style={styles.backDetailRow}>
        <Text style={styles.backDetailLabel}>PRODUCTO</Text>
        <Text style={styles.backDetailValue}>{card.category}</Text>
      </View>
      <View style={styles.backFooter}>
        <Text style={styles.backDemoLabel}>Demo · datos sensibles ocultos</Text>
        <Text style={[styles.backStatus, frozen && styles.backStatusFrozen]}>
          {frozen ? 'CONGELADA' : 'ACTIVA'}
        </Text>
      </View>
    </>
  );
}

function InteractiveCard({ card, frozen, flipped }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startRotation = useSharedValue(0);
  const flipRotation = useSharedValue(0);

  useEffect(() => {
    flipRotation.value = withTiming(flipped ? 180 : 0, { duration: 520 });
    return () => cancelAnimation(flipRotation);
  }, [flipped, flipRotation]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((event) => {
      x.value = startX.value + event.translationX;
      y.value = startY.value + event.translationY;
    });
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = Math.max(0.7, Math.min(1.7, startScale.value * event.scale));
    });
  const rotate = Gesture.Rotation()
    .onBegin(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = startRotation.value + event.rotation;
    });
  const gesture = Gesture.Simultaneous(pan, pinch, rotate);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}rad` },
      { scale: scale.value },
    ],
  }));
  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${flipRotation.value}deg` }],
  }));
  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${flipRotation.value + 180}deg` }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.interactiveCard, animatedStyle]}>
        <Animated.View style={[styles.cardFace, { backgroundColor: card.tone }, frontFaceStyle]}>
          <FocusGlow color={card.accent} size={145} style={styles.detailGlow} />
          <CardArtwork card={card} frozen={frozen} />
        </Animated.View>
        <Animated.View style={[styles.cardFace, styles.backFace, { backgroundColor: card.tone }, backFaceStyle]}>
          <CardBackArtwork card={card} frozen={frozen} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function CardsScreen() {
  const { balance, travelSavings, frozenCards, toggleCardFrozen } = useBanking();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const activeIndex = useSharedValue(0);
  const drag = useSharedValue(0);
  const activeCard = cards[activeCardIndex];
  const activeCardFrozen = Boolean(frozenCards[activeCard.id]);
  const activeCardBalance = activeCard.id === 'physical'
    ? formatMoney(balance)
    : activeCard.id === 'travel' ? formatMoney(travelSavings) : 'Pagos online';

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      drag.value = event.translationX;
    })
    .onEnd((event) => {
      let nextIndex = activeIndex.value;
      if (event.translationX < -50) nextIndex = Math.min(cards.length - 1, nextIndex + 1);
      if (event.translationX > 50) nextIndex = Math.max(0, nextIndex - 1);
      activeIndex.value = withTiming(nextIndex, { duration: 280 });
      drag.value = withSpring(0);
      runOnJS(setActiveCardIndex)(nextIndex);
    });

  const goToCard = (direction) => {
    const nextIndex = Math.max(0, Math.min(cards.length - 1, activeCardIndex + direction));
    activeIndex.value = withTiming(nextIndex, { duration: 280 });
    drag.value = withSpring(0);
    setActiveCardIndex(nextIndex);
  };

  useEffect(() => {
    if (!detailsVisible) setCardFlipped(false);
  }, [detailsVisible]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>TU CARTERA DIGITAL</Text>
        <Text style={styles.title}>Tarjetas</Text>
        <Text style={styles.subtitle}>Gestiona tus tarjetas y controla cómo pagas.</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.carouselStage}>
          {cards.map((card, index) => (
            <CardSlide
              key={card.id}
              card={card}
              index={index}
              activeIndex={activeIndex}
              drag={drag}
              frozen={Boolean(frozenCards[card.id])}
            />
          ))}
        </View>
      </GestureDetector>

      <View style={styles.carouselControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tarjeta anterior"
          disabled={activeCardIndex === 0}
          onPress={() => goToCard(-1)}
          style={[styles.carouselControl, activeCardIndex === 0 && styles.controlDisabled]}
        >
          <Ionicons name="chevron-back" size={19} color={colors.primaryDark} />
        </Pressable>
        <View style={styles.cardDots}>
          {cards.map((card, index) => (
            <View key={card.id} style={[styles.cardDot, index === activeCardIndex && styles.cardDotActive]} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tarjeta siguiente"
          disabled={activeCardIndex === cards.length - 1}
          onPress={() => goToCard(1)}
          style={[styles.carouselControl, activeCardIndex === cards.length - 1 && styles.controlDisabled]}
        >
          <Ionicons name="chevron-forward" size={19} color={colors.primaryDark} />
        </Pressable>
      </View>

      <View style={styles.cardSummary}>
        <View style={styles.summaryCopy}>
          <Text style={styles.selectedCardTitle}>{activeCard.name}</Text>
          <Text style={styles.selectedCardSubtitle}>•••• {activeCard.lastFour} · {activeCard.category}</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.cardBalanceCaption}>Saldo disponible</Text>
          <Text style={styles.cardBalance}>{activeCardBalance}</Text>
          <View style={styles.cardStatus}>
            <View style={[styles.statusDot, activeCardFrozen && styles.statusDotFrozen]} />
            <Text style={[styles.statusText, activeCardFrozen && styles.statusTextFrozen]}>
              {activeCardFrozen ? 'CONGELADA' : 'ACTIVA'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <BounceAction
          title={activeCardFrozen ? 'Descongelar' : 'Congelar tarjeta'}
          icon={activeCardFrozen ? 'sunny-outline' : 'snow-outline'}
          onPress={() => toggleCardFrozen(activeCard.id)}
        />
        <BounceAction
          title="Ver tarjeta"
          icon="scan-outline"
          variant="primary"
          onPress={() => setDetailsVisible(true)}
        />
      </View>

      <View style={styles.securityNote}>
        <View style={styles.securityIcon}>
          <Ionicons name="shield-checkmark-outline" size={19} color={colors.success} />
        </View>
        <View style={styles.securityCopy}>
          <Text style={styles.securityTitle}>Control en tus manos</Text>
          <Text style={styles.securityText}>Congela una tarjeta al instante y descongélala cuando vuelvas a usarla.</Text>
        </View>
      </View>

      <View style={styles.gestureNote}>
        <Ionicons name="hand-left-outline" size={15} color={colors.textMuted} />
        <Text style={styles.gestureText}>Desliza para cambiar de tarjeta. En «Ver tarjeta» puedes moverla, ampliarla y rotarla.</Text>
      </View>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <GestureHandlerRootView style={styles.modalRoot}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Vista de tarjeta</Text>
                  <Text style={styles.modalSubtitle}>•••• {activeCard.lastFour}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar vista de tarjeta"
                  onPress={() => setDetailsVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={21} color={colors.primaryDark} />
                </Pressable>
              </View>
              <View style={styles.interactiveStage}>
                <InteractiveCard
                  key={activeCard.id}
                  card={activeCard}
                  frozen={activeCardFrozen}
                  flipped={cardFlipped}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={cardFlipped ? 'Ver frente de tarjeta' : 'Ver reverso de tarjeta'}
                onPress={() => setCardFlipped((flipped) => !flipped)}
                style={({ pressed }) => [styles.flipButton, pressed && styles.flipButtonPressed]}
              >
                <Ionicons name="sync-outline" size={17} color={colors.primary} />
                <Text style={styles.flipButtonText}>{cardFlipped ? 'Ver frente' : 'Ver reverso'}</Text>
              </Pressable>
              <Text style={styles.modalHint}>Arrastra para moverla; usa dos dedos para ampliar o girar.</Text>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  heading: { marginBottom: 12 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 7 },
  title: { color: colors.primaryDark, fontSize: 27, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 5 },
  carouselStage: { height: 236, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardSlide: {
    position: 'absolute', height: 196, borderRadius: 22, padding: 19, overflow: 'hidden',
    shadowColor: '#171824', shadowOpacity: 0.2, shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 }, elevation: 7,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBrand: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.4 },
  cardCategory: { color: 'rgba(255,255,255,0.68)', fontSize: 8, fontWeight: '700', letterSpacing: 0.7, marginTop: 4 },
  frozenPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  frozenPillText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800', marginLeft: 4 },
  chip: { width: 32, height: 24, borderRadius: 6, backgroundColor: '#D8C27B', marginTop: 17, overflow: 'hidden' },
  chipLineVertical: { position: 'absolute', width: 1, height: '100%', left: '50%', backgroundColor: 'rgba(90,75,35,0.4)' },
  chipLineHorizontal: { position: 'absolute', width: '100%', height: 1, top: '50%', backgroundColor: 'rgba(90,75,35,0.4)' },
  cardNumber: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', letterSpacing: 1.2, marginTop: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 },
  cardHolder: { color: 'rgba(255,255,255,0.76)', fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  cardInitial: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  cardOrbLarge: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -80, bottom: -90 },
  cardOrbSmall: { position: 'absolute', width: 110, height: 110, borderRadius: 55, right: 12, bottom: -65 },
  backStripe: { height: 30, backgroundColor: 'rgba(0,0,0,0.42)', marginHorizontal: -19, marginTop: 16, marginBottom: 10 },
  backBrand: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 1, marginBottom: 7 },
  backDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  backDetailLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 7, fontWeight: '800', letterSpacing: 0.6 },
  backDetailValue: { color: '#FFFFFF', fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  backFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  backDemoLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 7 },
  backStatus: { color: colors.success, fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  backStatusFrozen: { color: colors.warning },
  detailGlow: { right: -58, top: -50 },
  carouselControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 16 },
  carouselControl: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  controlDisabled: { opacity: 0.35 },
  cardDots: { flexDirection: 'row', gap: 6, marginHorizontal: 15 },
  cardDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D5D6DE' },
  cardDotActive: { width: 18, backgroundColor: colors.primary },
  cardSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceRaised, borderRadius: 16, padding: 15 },
  summaryCopy: { flex: 1 },
  summaryRight: { alignItems: 'flex-end' },
  selectedCardTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  selectedCardSubtitle: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  cardBalanceCaption: { color: colors.textMuted, fontSize: 8 },
  cardBalance: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', marginTop: 3 },
  cardStatus: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 5 },
  statusDotFrozen: { backgroundColor: colors.warning },
  statusText: { color: colors.success, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  statusTextFrozen: { color: colors.warning },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionPressable: { flex: 1 },
  actionButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  actionButtonSecondary: { backgroundColor: colors.surface },
  actionButtonPrimary: { backgroundColor: colors.primary },
  actionText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  actionTextPrimary: { color: '#FFFFFF' },
  securityNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successSoft, borderRadius: 17, padding: 14, marginTop: 20 },
  securityIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: '#1C493A', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  securityCopy: { flex: 1 },
  securityTitle: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  securityText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  gestureNote: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 15, paddingHorizontal: 3 },
  gestureText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15, marginLeft: 7 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(16,17,29,0.65)', justifyContent: 'center', padding: 18 },
  modalRoot: { flex: 1 },
  modalCard: { backgroundColor: colors.surfaceRaised, borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: colors.primaryDark, fontSize: 17, fontWeight: '800' },
  modalSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  interactiveStage: { height: 280, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 9 },
  interactiveCard: {
    width: Math.min(Dimensions.get('window').width - 90, 330),
    height: 195, borderRadius: 22,
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    padding: 19,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  backFace: { paddingTop: 0 },
  flipButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', gap: 7, marginTop: 1, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: colors.primarySoft },
  flipButtonPressed: { opacity: 0.72 },
  flipButtonText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  modalHint: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 8 },
});
