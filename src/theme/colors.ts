/**
 * MotoCare Design System — Color Tokens
 * Berdasarkan Stitch design system project
 */

export const colors = {
  // Brand
  primary: '#0F172A',
  primaryLight: '#1E293B',
  
  // Background & Surface
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceDim: '#F1F5F9',
  
  // Status Colors (Core Feature — seperti traffic light)
  safe: '#10B981',
  safeBg: 'rgba(16, 185, 129, 0.1)',
  safeLight: '#D1FAE5',
  
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  warningLight: '#FEF3C7',
  
  urgent: '#EF4444',
  urgentBg: 'rgba(239, 68, 68, 0.1)',
  urgentLight: '#FEE2E2',
  
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Border & Divider
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Input
  inputBg: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputFocus: '#0F172A',
  
  // Misc
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: 'rgba(15, 23, 42, 0.08)',
} as const;

export type StatusColor = 'safe' | 'warning' | 'urgent';

export const statusColors = {
  safe: {
    main: colors.safe,
    bg: colors.safeBg,
    light: colors.safeLight,
    label: 'Aman',
    emoji: '🟢',
  },
  warning: {
    main: colors.warning,
    bg: colors.warningBg,
    light: colors.warningLight,
    label: 'Peringatan',
    emoji: '🟡',
  },
  urgent: {
    main: colors.urgent,
    bg: colors.urgentBg,
    light: colors.urgentLight,
    label: 'Segera Ganti',
    emoji: '🔴',
  },
} as const;
