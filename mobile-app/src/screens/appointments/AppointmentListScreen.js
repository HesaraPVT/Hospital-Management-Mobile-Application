import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAppointmentsApi, updateAppointmentStatusApi } from '../../api/appointmentApi';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const AppointmentListScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === 'admin';

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointmentsApi();
      setAppointments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const handleStatusChange = async (id, nextStatus) => {
    setActionLoadingId(id);
    try {
      await updateAppointmentStatusApi(id, nextStatus);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: nextStatus } : a))
      );
      Alert.alert('Updated', `Appointment ${nextStatus}`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading appointments..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Appointments"
        subtitle={`${appointments.length} total`}
      />

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            message="No appointments found"
            subtitle="Book your first appointment with a specialist"
          />
        }
        renderItem={({ item }) => (
          <View>
            <AppointmentCard
              appointment={item}
              onPress={() => navigation.navigate('AppointmentDetails', { appointment: item })}
            />
            {isAdmin && item.status === 'pending' ? (
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnLeft, styles.approveBtn]}
                  disabled={actionLoadingId === item._id}
                  activeOpacity={0.8}
                  onPress={() => handleStatusChange(item._id, 'approved')}
                >
                  <Text style={styles.actionBtnText}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  disabled={actionLoadingId === item._id}
                  activeOpacity={0.8}
                  onPress={() => handleStatusChange(item._id, 'rejected')}
                >
                  <Text style={styles.actionBtnText}>✕ Reject</Text>
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
  adminActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 2,
  },
  actionBtnLeft: { marginRight: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  approveBtn: { backgroundColor: COLORS.success },
  rejectBtn: { backgroundColor: COLORS.danger },
  actionBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },
});

export default AppointmentListScreen;