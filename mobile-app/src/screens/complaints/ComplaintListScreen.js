import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getComplaintsApi, updateComplaintStatusApi } from '../../api/complaintApi';
import ComplaintCard from '../../components/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import CustomInput from '../../components/CustomInput';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme';

const ComplaintListScreen = ({ navigation }) => {
  const [complaints,      setComplaints]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [adminReply,      setAdminReply]      = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === 'admin';

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComplaintsApi();
      setComplaints(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const handleStatusUpdate = async (id, nextStatus) => {
    setActionLoadingId(id);
    try {
      await updateComplaintStatusApi(id, nextStatus, adminReply || undefined);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: nextStatus } : c))
      );
      Alert.alert('Updated', `Complaint marked as ${nextStatus.replace('_', ' ')}`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading complaints..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Complaints"
        subtitle={`${complaints.length} submissions`}
        rightAction={
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('ComplaintForm')}
            activeOpacity={0.8}
          >
            <Text style={styles.newBtnText}>+ New</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isAdmin ? (
            <View style={styles.replyBox}>
              <Text style={styles.replyBoxLabel}>ADMIN REPLY (applied to next action)</Text>
              <CustomInput
                value={adminReply}
                onChangeText={setAdminReply}
                placeholder="Write a reply for the patient..."
                multiline
                numberOfLines={3}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState message="No complaints found" subtitle="All clear — no submissions yet" />
        }
        renderItem={({ item }) => (
          <View>
            <ComplaintCard complaint={item} />
            {isAdmin ? (
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.progressBtn]}
                  disabled={actionLoadingId === item._id}
                  activeOpacity={0.8}
                  onPress={() => handleStatusUpdate(item._id, 'in_progress')}
                >
                  <Text style={styles.actionBtnText}>In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.resolvedBtn]}
                  disabled={actionLoadingId === item._id}
                  activeOpacity={0.8}
                  onPress={() => handleStatusUpdate(item._id, 'resolved')}
                >
                  <Text style={styles.actionBtnText}>Resolved</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 12, paddingBottom: 30 },
  newBtn: {
    backgroundColor: COLORS.tealBright,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  newBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },

  replyBox: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 14,
    shadowColor: COLORS.tealStrong, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  replyBoxLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 1.5, marginBottom: 8 },

  adminActions: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingBottom: 10, paddingTop: 4,
  },
  actionBtn: {
    flex: 1, paddingVertical: 11, borderRadius: RADIUS.md, alignItems: 'center',
  },
  progressBtn:   { backgroundColor: COLORS.warning },
  resolvedBtn:   { backgroundColor: COLORS.success },
  actionBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },
});

export default ComplaintListScreen;