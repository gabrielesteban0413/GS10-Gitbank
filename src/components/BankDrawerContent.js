import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { colors } from '../theme/colors';

export default function BankDrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <Ionicons name="pulse" size={20} color={colors.background} />
        </View>
        <Text style={styles.brandName}>Gidbank</Text>
        <Text style={styles.brandCaption}>BANCA DIGITAL</Text>
      </View>

      <View style={styles.account}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>Gabriel Boada</Text>
          <Text style={styles.accountType}>Cuenta personal</Text>
        </View>
        <Ionicons name="chevron-down" size={17} color="#A7A8B5" />
      </View>

      <Text style={styles.sectionLabel}>TU ESPACIO</Text>
      <DrawerItemList {...props} />

      <View style={styles.footer}>
        <Ionicons name="lock-closed-outline" size={15} color={colors.accent} />
        <Text style={styles.footerText}>Tu dinero, protegido</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingTop: 16, paddingBottom: 18 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 24,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    marginRight: 10,
  },
  brandName: { color: '#FFFFFF', fontSize: 19, fontWeight: '900', letterSpacing: 1.4 },
  brandCaption: {
    color: '#A7A8B5',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    position: 'absolute',
    left: 44,
    top: 22,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  avatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  accountInfo: { flex: 1 },
  accountName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  accountType: { color: '#A7A8B5', fontSize: 11, marginTop: 3 },
  sectionLabel: {
    color: '#858694',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginHorizontal: 25,
    marginBottom: 7,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.09)',
    marginTop: 'auto',
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  footerText: { color: '#B8B8C5', fontSize: 12, marginLeft: 8 },
});
