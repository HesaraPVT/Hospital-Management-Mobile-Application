import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReportsApi } from '../../api/reportApi';
import ReportCard from '../../components/ReportCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../theme';
import { AuthContext } from '../../context/AuthContext';

const ReportListScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportsApi();
      setReports(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Reports" subtitle={`${reports.length} report${reports.length === 1 ? '' : 's'} generated`} />
      <View style={styles.actionsRow}>
        {userInfo?.role !== 'admin' && (
          <TouchableOpacity style={styles.myReportsButton} onPress={() => navigation.navigate('MyReports')} activeOpacity={0.85}>
            <Text style={styles.myReportsButtonText}>📋 View My Medical Reports</Text>
          </TouchableOpacity>
        )}
        {userInfo?.role === 'admin' && (
          <TouchableOpacity style={styles.generateButton} onPress={() => navigation.navigate('ReportGenerate')} activeOpacity={0.85}>
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.roleNote}>{userInfo?.role === 'admin' ? 'Admin can view all reports' : 'You can view your own reports'}</Text>
      </View>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState message="No reports yet" subtitle="Generate your first report from the reports screen" />
        }
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={() => navigation.navigate('ReportDetail', { reportId: item._id })} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  actionsRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  myReportsButton: {
    backgroundColor: COLORS.tealBright,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.tealStrong,
  },
  myReportsButtonText: { color: COLORS.white, fontWeight: '700' },
  generateButton: {
    backgroundColor: COLORS.tealStrong,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  generateButtonText: { color: COLORS.white, fontWeight: '700' },
  roleNote: { color: COLORS.textMuted, fontSize: 12, marginBottom: 2 },
  list: { paddingTop: 6, paddingBottom: 30 },
});

export default ReportListScreen;