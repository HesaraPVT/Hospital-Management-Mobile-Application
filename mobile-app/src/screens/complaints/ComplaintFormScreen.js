import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { createComplaintApi, updateComplaintApi } from '../../api/complaintApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const CATEGORY_OPTIONS = ['Service', 'Billing', 'Medical', 'Staff', 'Facility', 'Other'];

const ComplaintFormScreen = ({ route, navigation }) => {
  const existingComplaint = route.params?.complaint;
  const isEdit = !!existingComplaint;

  const [title, setTitle] = useState(existingComplaint?.title || '');
  const [description, setDescription] = useState(existingComplaint?.description || '');
  const [category, setCategory] = useState(existingComplaint?.category || '');
  const [contactDetails, setContactDetails] = useState(existingComplaint?.contactDetails || '');
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (existingComplaint && existingComplaint.status !== 'submitted') {
      Alert.alert('Cannot Edit', 'This complaint is already under review or processed.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [existingComplaint, navigation]);

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      Alert.alert('Missing Fields', 'Please fill in title, description, and category.');
      return;
    }
    setLoading(true);
    try {
      const data = { 
        title, 
        description, 
        category, 
        contactDetails,
        updatedAt: isEdit ? existingComplaint.updatedAt : undefined
      };
      if (isEdit) {
        await updateComplaintApi(existingComplaint._id, data);
        navigation.goBack();
        Alert.alert('Updated', 'Your complaint has been updated successfully.');
      } else {
        await createComplaintApi(data);
        navigation.goBack();
        Alert.alert('Submitted', 'Your complaint has been received. We will get back to you shortly.');
      }
    } catch (error) {
      Alert.alert(isEdit ? 'Update Failed' : 'Submission Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message={isEdit ? "Updating complaint..." : "Submitting complaint..."} />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={isEdit ? "Edit Complaint" : "Submit Complaint"}
        subtitle="We take all feedback seriously"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <Text style={styles.infoText}>
            Your complaint will be reviewed by our admin team. You can edit or withdraw it as long as the status is "Submitted".
          </Text>
        </View>

        <Text style={styles.sectionLabel}>COMPLAINT DETAILS</Text>
        <View style={styles.formCard}>
          <CustomInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Brief summary of your concern"
          />

          {/* Category Dropdown */}
          <Text style={styles.dropdownLabel}>CATEGORY</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            activeOpacity={0.8}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={[styles.dropdownBtnText, !category && styles.dropdownPlaceholder]}>
              {category || 'Select a category'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <Modal
            visible={showCategoryPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCategoryPicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowCategoryPicker(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <FlatList
                  data={CATEGORY_OPTIONS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.modalOption, category === item && styles.modalOptionActive]}
                      onPress={() => { setCategory(item); setShowCategoryPicker(false); }}
                    >
                      <Text style={[styles.modalOptionText, category === item && styles.modalOptionTextActive]}>
                        {item}
                      </Text>
                      {category === item && <Text style={styles.checkMark}>✓</Text>}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <CustomInput
            label="Contact Details (Optional)"
            value={contactDetails}
            onChangeText={setContactDetails}
            placeholder="Phone or alternate email"
          />
          <CustomInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your complaint in detail..."
            multiline
            numberOfLines={6}
          />
        </View>

        <CustomButton title={isEdit ? "Save Changes" : "Submit Complaint"} onPress={handleSubmit} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: COLORS.bgPage },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel:  { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 10, marginLeft: 4, marginTop: 4 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.tealFaint, borderRadius: RADIUS.lg,
    padding: 14, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: COLORS.tealBright,
  },
  infoIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.tealBright, alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  infoIconText: { fontSize: 12, fontWeight: FONTS.bold, color: COLORS.white },
  infoText:     { flex: 1, fontSize: 12, color: COLORS.tealStrong, lineHeight: 18 },

  formCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 16, ...SHADOW.card,
  },

  // Dropdown styles
  dropdownLabel: {
    fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright,
    letterSpacing: 1.5, marginBottom: 6, marginTop: 12,
  },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgPage, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 4,
  },
  dropdownBtnText: { fontSize: 14, color: COLORS.navyDeep },
  dropdownPlaceholder: { color: COLORS.textSecondary },
  dropdownArrow: { fontSize: 10, color: COLORS.textSecondary },

  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  modalContent: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    width: '100%', maxHeight: 400, padding: 20, ...SHADOW.card,
  },
  modalTitle: {
    fontSize: 16, fontWeight: FONTS.bold, color: COLORS.navyDeep,
    marginBottom: 14, textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  modalOptionActive: { backgroundColor: COLORS.tealFaint, borderRadius: RADIUS.md },
  modalOptionText: { fontSize: 15, color: COLORS.navyDeep },
  modalOptionTextActive: { color: COLORS.tealBright, fontWeight: FONTS.bold },
  checkMark: { fontSize: 16, color: COLORS.tealBright, fontWeight: FONTS.bold },
});

export default ComplaintFormScreen;