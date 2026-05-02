import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text, ScrollView, TextInput, Modal, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getComplaintsApi, updateComplaintStatusApi, deleteComplaintApi } from '../../api/complaintApi';
import ComplaintCard from '../../components/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const STATUS_OPTIONS = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const CATEGORY_OPTIONS = ['Service', 'Billing', 'Medical', 'Staff', 'Facility', 'Other'];

const ComplaintListScreen = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === 'admin';

  // --- Filtering States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // --- Admin Review Modal States ---
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalPriority, setModalPriority] = useState('');
  const [modalAdminReply, setModalAdminReply] = useState('');
  const [modalInternalNotes, setModalInternalNotes] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (isAdmin) {
        if (searchQuery) params.search = searchQuery;
        if (filterStatus) params.status = filterStatus;
        if (filterPriority) params.priority = filterPriority;
        if (filterCategory) params.category = filterCategory;
      }
      const res = await getComplaintsApi(params);
      setComplaints(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [searchQuery, filterStatus, filterPriority, filterCategory, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  // --- Admin Actions ---
  const openReviewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalPriority(complaint.priority);
    setModalAdminReply(complaint.adminReply || '');
    setModalInternalNotes(complaint.internalNotes || '');
  };

  const handleAdminUpdate = async () => {
    setActionLoadingId(selectedComplaint._id);
    try {
      await updateComplaintStatusApi(selectedComplaint._id, { 
        status: modalStatus, 
        priority: modalPriority,
        adminReply: modalAdminReply || undefined,
        internalNotes: modalInternalNotes || undefined,
        updatedAt: selectedComplaint.updatedAt
      });
      Alert.alert('Updated', 'Complaint has been successfully updated.');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Update failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- User Actions ---
  // --- User Actions ---
  const performDelete = async (id) => {
    setActionLoadingId(id);
    try {
      await deleteComplaintApi(id);
      Alert.alert('Deleted', 'Your complaint has been removed.');
      fetchComplaints();
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || 'Could not delete.';
      Alert.alert('Delete Failed', errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this complaint permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', style: 'destructive', onPress: () => performDelete(id) }
      ]
    );
  };

  if (loading && complaints.length === 0) return <LoadingSpinner message="Loading complaints..." />;

  const isFilterActive = filterStatus || filterPriority || filterCategory;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Complaints"
        subtitle={`${complaints.length} records`}
        rightAction={
          !isAdmin ? (
            <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('ComplaintForm')} activeOpacity={0.8}>
              <Text style={styles.newBtnText}>+ New</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.newBtn, isFilterActive && { backgroundColor: COLORS.warning }]} 
              onPress={() => setShowFilterModal(true)} 
              activeOpacity={0.8}
            >
              <Text style={styles.newBtnText}>Filters {isFilterActive ? '(On)' : ''}</Text>
            </TouchableOpacity>
          )
        }
      />

      <FlatList
        data={complaints}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState message="No complaints found" subtitle="All clear — no submissions match." />
        }
        renderItem={({ item }) => (
          <View>
            <ComplaintCard 
            complaint={item} 
            isAdmin={isAdmin} 
            onRefresh={fetchComplaints}
          />  
            
            {/* Admin Action */}
            {isAdmin ? (
              <View style={styles.adminActionRow}>
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => openReviewModal(item)}
                >
                  <Text style={styles.reviewBtnText}>Review & Update</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* User Actions */}
            {!isAdmin && item.status === 'submitted' ? (
              <View style={styles.userActions}>
                <TouchableOpacity style={[styles.uActionBtn, styles.editBtn]} onPress={() => navigation.navigate('ComplaintForm', { complaint: item })}>
                  <Text style={styles.uActionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.uActionBtn, styles.withdrawBtn]} 
                  onPress={() => handleDelete(item._id)}
                  disabled={actionLoadingId === item._id}
                >
                  <Text style={styles.uActionBtnText}>
                    {actionLoadingId === item._id ? 'Deleting...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      />

      {/* --- ADMIN REVIEW MODAL --- */}
      <Modal visible={!!selectedComplaint} transparent animationType="slide" onRequestClose={() => setSelectedComplaint(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Complaint</Text>
                <Text style={styles.modalSubtitle}>{selectedComplaint?.complaintId}</Text>
              </View>

              <Text style={styles.label}>STATUS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {STATUS_OPTIONS.map(status => (
                  <TouchableOpacity 
                    key={status} 
                    style={[styles.chip, modalStatus === status && styles.chipActive]}
                    onPress={() => setModalStatus(status)}
                  >
                    <Text style={[styles.chipText, modalStatus === status && styles.chipTextActive]}>
                      {status.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>PRIORITY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {PRIORITY_OPTIONS.map(prio => (
                  <TouchableOpacity 
                    key={prio} 
                    style={[styles.chip, modalPriority === prio && styles.chipActive]}
                    onPress={() => setModalPriority(prio)}
                  >
                    <Text style={[styles.chipText, modalPriority === prio && styles.chipTextActive]}>
                      {prio}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <CustomInput
                label="Admin Reply (Visible to User)"
                value={modalAdminReply}
                onChangeText={setModalAdminReply}
                placeholder="Type your response here..."
                multiline numberOfLines={3}
              />

              <CustomInput
                label="Internal Notes (Hidden from User)"
                value={modalInternalNotes}
                onChangeText={setModalInternalNotes}
                placeholder="Private notes for admins..."
                multiline numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedComplaint(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAdminUpdate} disabled={actionLoadingId === selectedComplaint?._id}>
                  <Text style={styles.saveBtnText}>
                    {actionLoadingId === selectedComplaint?._id ? 'Saving...' : 'Save Updates'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- FILTER MODAL --- */}
      <Modal visible={showFilterModal} transparent animationType="fade" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Complaints</Text>

            <Text style={styles.label}>STATUS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity style={[styles.chip, !filterStatus && styles.chipActive]} onPress={() => setFilterStatus('')}>
                <Text style={[styles.chipText, !filterStatus && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {STATUS_OPTIONS.map(status => (
                <TouchableOpacity key={status} style={[styles.chip, filterStatus === status && styles.chipActive]} onPress={() => setFilterStatus(status)}>
                  <Text style={[styles.chipText, filterStatus === status && styles.chipTextActive]}>{status.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>PRIORITY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity style={[styles.chip, !filterPriority && styles.chipActive]} onPress={() => setFilterPriority('')}>
                <Text style={[styles.chipText, !filterPriority && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {PRIORITY_OPTIONS.map(prio => (
                <TouchableOpacity key={prio} style={[styles.chip, filterPriority === prio && styles.chipActive]} onPress={() => setFilterPriority(prio)}>
                  <Text style={[styles.chipText, filterPriority === prio && styles.chipTextActive]}>{prio}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity style={[styles.chip, !filterCategory && styles.chipActive]} onPress={() => setFilterCategory('')}>
                <Text style={[styles.chipText, !filterCategory && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {CATEGORY_OPTIONS.map(cat => (
                <TouchableOpacity key={cat} style={[styles.chip, filterCategory === cat && styles.chipActive]} onPress={() => setFilterCategory(cat)}>
                  <Text style={[styles.chipText, filterCategory === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setFilterStatus(''); setFilterPriority(''); setFilterCategory(''); }}>
                <Text style={styles.cancelBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={() => { setShowFilterModal(false); fetchComplaints(); }}>
                <Text style={styles.saveBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 6, paddingBottom: 30 },
  newBtn: {
    backgroundColor: COLORS.tealBright,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  newBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },

  searchContainer: { paddingHorizontal: 16, marginBottom: 4 },
  searchInput: {
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: RADIUS.md, fontSize: 14, color: COLORS.navyDeep,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },

  adminActionRow: { paddingHorizontal: 16, paddingBottom: 16, marginTop: -4 },
  reviewBtn: {
    backgroundColor: COLORS.navyDeep, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center'
  },
  reviewBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },

  userActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16, marginTop: -4 },
  uActionBtn: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.md, alignItems: 'center' },
  editBtn: { backgroundColor: COLORS.tealStrong },
  withdrawBtn: { backgroundColor: COLORS.danger },
  uActionBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },

  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg * 2, borderTopRightRadius: RADIUS.lg * 2,
    padding: 20, maxHeight: '90%', ...SHADOW.card,
  },
  modalHeader: { marginBottom: 16, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  modalSubtitle: { fontSize: 12, color: COLORS.tealStrong, fontWeight: FONTS.bold, marginTop: 4 },
  
  label: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 1.5, marginBottom: 8, marginTop: 6 },
  chipScroll: { flexDirection: 'row', marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgOverlay, marginRight: 8, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  chipActive: { backgroundColor: COLORS.tealBright, borderColor: COLORS.tealBright },
  chipText: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white, fontWeight: FONTS.bold },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10, marginBottom: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', backgroundColor: COLORS.bgOverlay },
  cancelBtnText: { color: COLORS.navyDeep, fontWeight: FONTS.bold },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', backgroundColor: COLORS.tealStrong },
  saveBtnText: { color: COLORS.white, fontWeight: FONTS.bold },
});

export default ComplaintListScreen;