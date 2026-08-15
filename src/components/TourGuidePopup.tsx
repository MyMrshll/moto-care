import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { ShieldCheck, Gauge, Bell, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, spacing } from '../theme/spacing';

const { width } = Dimensions.get('window');

const TOUR_STEPS = [
  {
    id: 1,
    title: 'Selamat Datang di MotoCare',
    description: 'Aplikasi pintar pelacak perawatan motor. Pantau kondisi & jadwal ganti oli kendaraan Anda dengan mudah.',
    Icon: ShieldCheck,
    color: colors.primary,
  },
  {
    id: 2,
    title: 'Pelacakan Kilometer Akurat',
    description: 'Catat kilometer setiap kali servis atau ganti oli. MotoCare akan menghitung sisa batas KM secara otomatis.',
    Icon: Gauge,
    color: '#3B82F6',
  },
  {
    id: 3,
    title: 'Pengingat Otomatis',
    description: 'Dapatkan pengingat tepat waktu saat oli motor Anda mendekati batas kilometer atau masa pakai.',
    Icon: Bell,
    color: colors.safe,
  },
];

export const TourGuidePopup = () => {
  const { hasSeenOnboarding, completeOnboarding } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Reset langkah tutorial ke awal setiap kali status onboarding di-reset
  useEffect(() => {
    if (!hasSeenOnboarding) {
      setCurrentStep(0);
    }
  }, [hasSeenOnboarding]);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  if (hasSeenOnboarding) return null;

  const animateToNextStep = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      animateToNextStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.Icon;

  return (
    <Modal
      transparent
      visible={!hasSeenOnboarding}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {TOUR_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index === currentStep && { backgroundColor: step.color },
                ]}
              />
            ))}
          </View>

          {/* Animated Content */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${step.color}15` }]}>
              <Icon size={44} color={step.color} strokeWidth={2} />
            </View>

            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </Animated.View>

          {/* Footer Controls */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
              <Text style={styles.skipText}>Lewati</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: step.color }]}
              activeOpacity={0.85}
            >
              <Text style={styles.nextText}>
                {currentStep === TOUR_STEPS.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
              </Text>
              {currentStep === TOUR_STEPS.length - 1 ? (
                <CheckCircle2 size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              ) : (
                <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: layout.radiusXl,
    padding: spacing['2xl'],
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  progressDotActive: {
    width: 24,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  skipButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typography.bodyMd,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: layout.radiusMd,
  },
  nextText: {
    ...typography.bodyLg,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
});

