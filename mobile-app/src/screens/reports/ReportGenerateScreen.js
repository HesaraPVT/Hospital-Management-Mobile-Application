import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { generateReportApi } from '../../api/reportApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const REPORT_TYPES = [
  { key: 'appointments', label: 'Appointment Report', sub: 'Booking stats & trends', color: COLORS.tealFaint, accent: COLORS.tealBright, emoji: '📅' },
  { key: 'revenue', label: 'Revenue Report', sub: 'Financial overview', color: '#e6f7f0', accent: COLORS.success, emoji: '💰' },
  { key: 'doctor_performance', label: 'Doctor Performance Report', sub: 'Specialist analytics', color: '#fff7ed', accent: COLORS.warning, emoji: '👨‍⚕️' },
];

const ReportGenerateScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!selected) { Alert.alert('Select a report type', 'Please select one of the report types below.'); return; }
    setLoading(true);
    try {
      await generateReportApi({ reportType: selected });
      Alert.alert('Report Generated', 'Your report has been successfully created.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Report generation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating report..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Generate Report" subtitle="Select a report type to create" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>REPORT TYPE</Text>
        {REPORT_TYPES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.reportCard, selected === r.key && styles.reportCardSelected]}
            onPress={() => setSelected(r.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.reportIcon, { backgroundColor: r.color }]}>
              <Text style={styles.reportEmoji}>{r.emoji}</Text>
            </View>
            <View style={styles.reportInfo}>
              <Text style={[styles.reportLabel, selected === r.key && { color: COLORS.tealStrong }]}>{r.label}</Text>
              <Text style={styles.reportSub}>{r.sub}</Text>
            </View>
            <View style={[styles.radio, selected === r.key && { borderColor: r.accent }]}>
              {selected === r.key ? <View style={[styles.radioDot, { backgroundColor: r.accent }]} /> : null}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.generateBtn, !selected && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={[styles.generateBtnText, !selected && { color: COLORS.textMuted }]}>Generate Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 12, marginLeft: 4 },

  reportCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.divider,
    padding: 14, marginVertical: 5, ...SHADOW.card,
  },
  reportCardSelected: { borderColor: COLORS.tealStrong, backgroundColor: COLORS.tealFaint },
  reportIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  reportEmoji: { fontSize: 24 },
  reportInfo: { flex: 1 },
  reportLabel: { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  reportSub: { fontSize: 12, fontWeight: FONTS.regular, color: COLORS.textMuted, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.tealPale,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  generateBtn: {
    backgroundColor: COLORS.tealStrong, paddingVertical: 15,
    borderRadius: RADIUS.md, alignItems: 'center', marginTop: 20,
    ...SHADOW.btn,
  },
  generateBtnDisabled: { backgroundColor: COLORS.tealPale, shadowOpacity: 0, elevation: 0 },
  generateBtnText: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.white, letterSpacing: 0.4 },
});

export default ReportGenerateScreen;