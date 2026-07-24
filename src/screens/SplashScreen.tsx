/**
 * SplashScreen — Logo + auto-navigate
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';
import { useAppStore } from '../store/useAppStore';
import { Droplet } from 'lucide-react-native';

interface SplashScreenProps {
  onFinish: (hasVehicle: boolean) => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const vehicles = useAppStore((s) => s.vehicles);

  useEffect(() => {
    // Animasi masuk
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle muncul setelah logo
    setTimeout(() => {
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Navigate setelah 2.5 detik
    const timer = setTimeout(() => {
      onFinish(vehicles.length > 0);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Dekoratif circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Droplet size={64} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>MotoCare</Text>
      </Animated.View>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleAnim }]}>
        Pelacak Oli Cerdas
      </Animated.Text>

      <Animated.View style={[styles.footer, { opacity: subtitleAnim }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, { backgroundColor: colors.safe }]} />
          <View style={[styles.dot, { backgroundColor: colors.warning }]} />
          <View style={[styles.dot, { backgroundColor: colors.urgent }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: -50,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.02)',
    bottom: 100,
    left: -60,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowRadius: 20,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...typography.headlineLg,
    color: colors.textInverse,
    fontSize: 36,
    letterSpacing: -1,
  },
  subtitle: {
    ...typography.bodyLg,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
