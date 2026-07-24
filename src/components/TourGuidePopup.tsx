import React, { useState } from 'react';
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
import { MapPin, Bell, Settings, ArrowRight, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TOUR_STEPS = [
  {
    id: 1,
    title: 'Selamat Datang di MotoCare',
    description: 'Aplikasi pintar untuk memantau jadwal ganti oli kendaraan Anda tanpa ribet.',
    Icon: MapPin,
    color: '#0066CC',
  },
  {
    id: 2,
    title: 'Tracking Akurat',
    description: 'Catat kilometer setiap kali ganti oli, dan kami akan menghitung sisanya untuk Anda.',
    Icon: Settings,
    color: '#F59E0B',
  },
  {
    id: 3,
    title: 'Notifikasi Tepat Waktu',
    description: 'Dapatkan pengingat otomatis saat kendaraan Anda sudah waktunya ganti oli.',
    Icon: Bell,
    color: '#10B981',
  },
];

export const TourGuidePopup = () => {
  const { hasSeenOnboarding, completeOnboarding } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Jika sudah pernah melihat onboarding, jangan tampilkan
  if (hasSeenOnboarding) return null;

  const animateToNextStep = (nextStep: number) => {
    // Animate out current content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: -20, // Slide left
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Update step
      setCurrentStep(nextStep);
      
      // Prepare for animating in
      slideAnim.setValue(20); // Start from right
      
      // Animate in new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to center
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
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${step.color}15` }]}>
              <Icon size={48} color={step.color} strokeWidth={1.5} />
            </View>

            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </Animated.View>

          {/* Footer / Controls */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Lewati</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.nextButton, { backgroundColor: step.color }]}
              activeOpacity={0.8}
            >
              <Text style={styles.nextText}>
                {currentStep === TOUR_STEPS.length - 1 ? 'Mulai' : 'Lanjut'}
              </Text>
              {currentStep === TOUR_STEPS.length - 1 ? (
                <CheckCircle2 size={20} color="#fff" style={{ marginLeft: 8 }} />
              ) : (
                <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#0066CC',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
