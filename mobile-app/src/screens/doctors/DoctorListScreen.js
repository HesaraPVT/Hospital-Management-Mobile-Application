import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDoctorsApi, updateDoctorApi, deleteDoctorApi } from '../../api/doctorApi';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme';

const DoctorListScreen = ({ navigation }) => {
  const [doctors, setDoctors]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === 'admin';

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDoctorsApi();
      setDoctors(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDoctors();
    }, [fetchDoctors])
  );

  const handleDelete = (doctor) => {
    Alert.alert(
      'Delete Doctor',
      `Are you sure you want to remove ${doctor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(doctor._id);
              await deleteDoctorApi(doctor._id);
              setDoctors((prev) => prev.filter((d) => d._id !== doctor._id));
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Delete failed');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner message="Loading doctors..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Our Specialists"
        subtitle={`${doctors.length} doctors available`}
        rightAction={
          isAdmin ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('DoctorForm')}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState message="No doctors available" subtitle="Check back soon" />}
        renderItem={({ item }) => (
          <View>
            <DoctorCard
              doctor={item}
              onPress={() => navigation.navigate('DoctorDetails', { doctor: item })}
            />
            {isAdmin ? (
              <View style={styles.adminRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity
                    style={styles.editLink}
                    onPress={() => navigation.navigate('DoctorForm', { doctor: item })}
                    disabled={actionLoadingId !== null}
                  >
                    <Text style={styles.editLinkText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editLink}
                    onPress={() => handleDelete(item)}
                    disabled={actionLoadingId !== null}
                  >
                    <Text style={[styles.editLinkText, { color: COLORS.danger }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.togglePill,
                    { backgroundColor: item.availabilityStatus ? COLORS.dangerBg : COLORS.successBg },
                  ]}
                  disabled={actionLoadingId === item._id}
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      setActionLoadingId(item._id);
                      await updateDoctorApi(item._id, { availabilityStatus: !item.availabilityStatus });
                      setDoctors((prev) =>
                        prev.map((d) =>
                          d._id === item._id ? { ...d, availabilityStatus: !item.availabilityStatus } : d
                        )
                      );
                    } catch (error) {
                      Alert.alert('Error', error.response?.data?.message || 'Update failed');
                    } finally {
                      setActionLoadingId(null);
                    }
                  }}
                >
                  <Text style={[
                    styles.togglePillText,
                    { color: item.availabilityStatus ? COLORS.danger : COLORS.success },
                  ]}>
                    {item.availabilityStatus ? 'Mark Unavailable' : 'Mark Available'}
                  </Text>
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
  addBtn: {
    backgroundColor: COLORS.tealBright,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 2,
  },
  editLink:     { paddingVertical: 4, paddingHorizontal: 2 },
  editLinkText: { fontSize: 12, color: COLORS.link, fontWeight: FONTS.semibold },
  togglePill:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full },
  togglePillText:{ fontSize: 12, fontWeight: FONTS.bold },
});

export default DoctorListScreen;