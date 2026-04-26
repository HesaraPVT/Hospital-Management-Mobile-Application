import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../theme';

const typeIcon = (type) => {
  switch (type) {
    case 'appointments': return { label: 'APT', bg: COLORS.tealFaint, text: COLORS.tealStrong };
    case 'revenue': return { label: 'REV', bg: '#e6f7f0', text: COLORS.success };
    case 'doctor_performance': return { label: 'DOC', bg: '#fff7ed', text: COLORS.warning };
    default: return { label: 'RPT', bg: COLORS.bgMuted, text: COLORS.textMuted };
  }
};

const ReportCard = ({ report, onPress }) => {
  const icon = typeIcon(report.reportType);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
        <Text style={[styles.iconText, { color: icon.text }]}>{icon.label}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{report.title || 'Report'}</Text>
        <Text style={styles.type}>{report.reportType?.replace('_', ' ')}</Text>
      </View>
      <View style={styles.arrow}>
        <View style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    ...SHADOW.card,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  info: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.navyDeep,
    marginBottom: 3,
  },
  type: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  arrow: { paddingLeft: 8 },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: COLORS.tealPale,
    transform: [{ rotate: '45deg' }],
  },
});

export default ReportCard;