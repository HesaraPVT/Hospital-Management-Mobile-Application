import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { deleteReportApi, getReportByIdApi, updateReportApi } from '../../api/reportApi';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const formatOutput = (data) => {
  if (Array.isArray(data)) {
    return data
      .map((item, index) => `${index + 1}. ${Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(' | ')}`)
      .join('\n\n');
  }

  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
      .join('\n');
  }

  return String(data ?? 'No output available');
};

const ReportDetailScreen = ({ route, navigation }) => {
  const { reportId } = route.params;
  const { userInfo } = React.useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportByIdApi(reportId);
      setReport(res.data);
      setTitle(res.data.title || '');
      setDescription(res.data.description || '');
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Could not load report.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [navigation, reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport])
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateReportApi(reportId, { title, description });
      setReport(res.data);
      Alert.alert('Saved', 'Report details updated successfully.');
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Could not update report.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReportApi(reportId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Failed', error.response?.data?.message || 'Could not delete report.');
          }
        },
      },
    ]);
  };

  if (loading || !report) return <LoadingSpinner message="Loading report..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Report Details" subtitle={report.reportType?.replace('_', ' ')} onBack={() => navigation.goBack()} />
      {/* Top back for larger screens/web */}
      <View style={styles.topBackWrap}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBackBtn} activeOpacity={0.8}>
          <Text style={styles.topBackText}>← Back to Reports</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>INPUT</Text>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Report title" placeholderTextColor={COLORS.textMuted} />
          <Text style={[styles.label, { marginTop: 12 }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            placeholder="Short description"
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>OUTPUT</Text>
          <Text style={styles.outputText}>{formatOutput(report.data)}</Text>
        </View>

        <View style={styles.metaCard}>
          <Text style={styles.metaText}>Created: {new Date(report.createdAt).toLocaleString()}</Text>
          <Text style={styles.metaText}>Updated: {new Date(report.updatedAt).toLocaleString()}</Text>
          <Text style={styles.metaText}>By: {report.generatedBy?.name || 'Unknown'}</Text>
        </View>

        {userInfo?.role === 'admin' ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.85}>
            <Text style={styles.deleteButtonText}>Delete Report</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.adminNoteBox}>
            <Text style={styles.adminNoteText}>Admins can delete reports from this screen.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom back action for easier navigation */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.backActionButton, SHADOW.sm]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.actionButtonIcon}>←</Text>
          <Text style={styles.actionButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: 14, marginBottom: 14, ...SHADOW.card },
  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: FONTS.semibold, color: COLORS.navyDeep, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: COLORS.navyDeep,
    backgroundColor: COLORS.bgPage,
  },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  saveButton: { backgroundColor: COLORS.tealStrong, borderRadius: RADIUS.md, alignItems: 'center', paddingVertical: 13, marginTop: 14 },
  saveButtonText: { color: COLORS.white, fontWeight: '700' },
  outputText: { color: COLORS.navyDeep, fontSize: 13, lineHeight: 20, fontFamily: 'monospace' },
  metaCard: { paddingHorizontal: 2, marginBottom: 14 },
  metaText: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  adminNoteBox: {
    backgroundColor: COLORS.bgPage,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  adminNoteText: { color: COLORS.textMuted, fontSize: 12 },
  deleteButton: { backgroundColor: '#FEE2E2', borderRadius: RADIUS.md, alignItems: 'center', paddingVertical: 13 },
  deleteButtonText: { color: '#B91C1C', fontWeight: '700' },
  topBackWrap: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  topBackBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  topBackText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  backActionButton: {
    width: 92,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  actionButtonText: {
    ...FONTS.body3_bold,
    color: COLORS.tealBright,
  },
});

export default ReportDetailScreen;