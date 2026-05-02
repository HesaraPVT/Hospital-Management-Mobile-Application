import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

const DoctorIcon = ({ color, size = 32 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Head */}
    <View style={{
      position: 'absolute', top: 0,
      width: size * 0.44, height: size * 0.44,
      borderRadius: size * 0.22, backgroundColor: color,
    }} />
    {/* Body */}
    <View style={{
      position: 'absolute', bottom: 0,
      width: size * 0.72, height: size * 0.46,
      backgroundColor: color, borderTopLeftRadius: size * 0.36, borderTopRightRadius: size * 0.36,
    }} />
    {/* Stethoscope cross */}
    <View style={{
      position: 'absolute', bottom: size * 0.22,
      width: size * 0.22, height: size * 0.04,
      backgroundColor: COLORS.white,
    }} />
    <View style={{
      position: 'absolute', bottom: size * 0.14,
      width: size * 0.04, height: size * 0.22,
      backgroundColor: COLORS.white,
    }} />
  </View>
);

const DoctorCard = ({ doctor, onPress }) => {
  // force reload
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          {doctor.image ? (
            <Image source={{ uri: doctor.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <DoctorIcon color={COLORS.tealBright} size={34} />
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: doctor.availabilityStatus ? COLORS.success : COLORS.danger }]} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{doctor.name || 'Unknown Doctor'}</Text>
          <Text style={styles.specialization} numberOfLines={1}>
            {doctor.specialization || 'Specialist'} {doctor.qualifications ? `• ${doctor.qualifications}` : ''}
          </Text>
          <View style={styles.departmentBadge}>
            <Text style={styles.departmentText}>{doctor.department || 'General'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Experience</Text>
          <Text style={styles.statValue}>{doctor.experience ? `${doctor.experience} yrs` : 'N/A'}</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Consultation</Text>
          <Text style={styles.statValue}>{doctor.consultationFee ? `Rs ${doctor.consultationFee}` : 'Free'}</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{doctor.availabilityStartTime || '09:00'} - {doctor.availabilityEndTime || '17:00'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.tealPale,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.tealBright,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.navyDeep,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  departmentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  departmentText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#f1f5f9',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: FONTS.semibold,
    color: COLORS.navyDeep,
  },
});

export default DoctorCard;