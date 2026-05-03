import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getReportsApi, deleteReportApi } from '../../api/reportApi';
import ReportCard from '../../components/ReportCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme';

const ReportListScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === 'admin';

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportsApi();
      setReports(res.data);
    } catch (e) {
      console.error('Error fetching reports:', e);
      if (e.response?.status === 403) {
        Alert.alert('Access Denied', 'Only admins can view reports.');
      }
    }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const handleDeleteReport = (reportId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReportApi(reportId);
              setReports(reports.filter(r => r._id !== reportId));
              Alert.alert('Success', 'Report deleted successfully.');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to delete report.');
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Reports"
        subtitle={`${reports.length} reports generated`}
        rightAction={
          isAdmin ? (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={() => navigation.navigate('ReportGenerate')}
              activeOpacity={0.8}
            >
              <Text style={styles.generateBtnText}>+ Generate</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            message={isAdmin ? "No reports yet" : "You don't have access to reports"}
            subtitle={isAdmin ? "Generate your first report using the Generate button" : "Only admins can view reports"}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ReportCard
              report={item}
              onPress={() => navigation.navigate('ReportDetail', { reportId: item._id })}
            />
            {isAdmin && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteReport(item._id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteBtnText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 12, paddingBottom: 30 },
  generateBtn: {
    backgroundColor: COLORS.tealBright,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
  },
  generateBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },
  cardContainer: { position: 'relative' },
  deleteBtn: {
    position: 'absolute',
    right: 10,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default ReportListScreen;