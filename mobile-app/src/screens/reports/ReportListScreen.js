import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReportsApi } from '../../api/reportApi';
import ReportCard from '../../components/ReportCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../theme';

const ReportListScreen = ({ navigation }) => {
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
      <ScreenHeader title="Reports" subtitle={`${reports.length} reports generated`} />
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState message="No reports yet" subtitle="Generate your first report from the admin dashboard" />
        }
        renderItem={({ item }) => <ReportCard report={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 12, paddingBottom: 30 },
});

export default ReportListScreen;