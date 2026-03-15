import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Typography } from '../../src/theme';
import { useActiveCards, useArchivedCards } from '../../src/store/useCardStore';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function StackTabIcon({ focused }: { focused: boolean }) {
  const count = useActiveCards().length;
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <View style={styles.stackIconWrapper}>
        <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>⬡</Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Stack</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
          ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <StackTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pipeline"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="≡" label="All" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="◎" label="Archive" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 72,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  tabBarBg: {
    backgroundColor: Colors.bgCard + 'F0',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 2,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabIconText: {
    fontSize: 22,
    color: Colors.tabInactive,
  },
  tabIconTextActive: {
    color: Colors.tabActive,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.tabInactive,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: Colors.tabActive,
  },
  stackIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.random,
    borderRadius: Radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
});
