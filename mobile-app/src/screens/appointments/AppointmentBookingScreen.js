import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { createAppointmentApi, getAvailableSlotsApi } from '../../api/appointmentApi';
import { getServicesApi } from '../../api/serviceApi';
import { addToWaitlistApi } from '../../api/waitlistApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getUpcomingDates = (days = 14) => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < days; i += 1) {
    const current = new Date(today);
    current.setDate(today.getDate() + i);
    const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = current.toLocaleDateString('en-US', { month: 'short' });
    dates.push({
      value: current.toISOString().split('T')[0],
      day: dayName,
      dayNumber: current.getDate(),
      month: monthName,
    });
  }

  return dates;
};

const AppointmentBookingScreen = ({ route, navigation }) => {
  const { doctor, preSelectDate, preSelectTime } = route.params;
  
  // Extract date portion if preSelectDate is in ISO format
  const formatDateToYYYYMMDD = (dateStr) => {
    if (!dateStr) return getTodayDate();
    // If it's in ISO format (2026-04-28T00:00:00.000Z), extract the date part
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    // If it's already in YYYY-MM-DD format, return as is
    return dateStr;
  };

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(formatDateToYYYYMMDD(preSelectDate));
  const [appointmentTime, setAppointmentTime] = useState(preSelectTime || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState({
    startTime: doctor?.availabilityStartTime || '09:00',
    endTime: doctor?.availabilityEndTime || '17:00',
  });
  const [bookedSlotModalVisible, setBookedSlotModalVisible] = useState(false);
  const [selectedBookedSlot, setSelectedBookedSlot] = useState(null);
  const [notifyMeChecked, setNotifyMeChecked] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const availableDates = getUpcomingDates(14);

  useEffect(() => {
    (async () => {
      try {
        const res = await getServicesApi();
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Fetch available slots when date OR service changes
  useEffect(() => {
    if (!doctor?._id || !appointmentDate || !selectedServiceId) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        // Validate date format before sending
        if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
          throw new Error('Invalid date format. Expected YYYY-MM-DD');
        }

        const res = await getAvailableSlotsApi(doctor._id, appointmentDate, selectedServiceId);
        setSlots(res.data.slots || []);
        setDoctorAvailability({
          startTime: res.data.availabilityStartTime,
          endTime: res.data.availabilityEndTime,
        });
        setAppointmentTime(''); // Reset selected time when date/service changes
      } catch (error) {
        console.error('Failed to fetch available slots:', error);
        console.error('Doctor ID:', doctor._id);
        console.error('Appointment Date:', appointmentDate);
        console.error('Service ID:', selectedServiceId);
        setSlots([]);
        Alert.alert('Error', 'Failed to load available slots. Please try again.');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [appointmentDate, doctor?._id, selectedServiceId]);

  const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d));
  const isValidTime = (t) => /^\d{2}:\d{2}$/.test(String(t));

  const handleNotifyMe = async () => {
    if (!notifyMeChecked) {
      Alert.alert('Info', 'Please check "Notify me" to receive notifications');
      return;
    }

    setWaitlistLoading(true);
    try {
      await addToWaitlistApi({
        doctorId: doctor._id,
        appointmentDate,
        slotTime: selectedBookedSlot,
      });
      Alert.alert('Success', 'You will be notified when this slot becomes available');
      setBookedSlotModalVisible(false);
      setNotifyMeChecked(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add to waitlist');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleBook = async () => {
    if (!doctor?._id) { Alert.alert('Error', 'Doctor info missing'); return; }
    if (!selectedServiceId || !appointmentDate || !appointmentTime) { Alert.alert('Error', 'Please fill all required fields'); return; }
    if (!isValidDate(appointmentDate)) { Alert.alert('Error', 'Date must be YYYY-MM-DD'); return; }
    if (!isValidTime(appointmentTime)) { Alert.alert('Error', 'Time must be HH:MM'); return; }

    setLoading(true);
    try {
      await createAppointmentApi({ doctorId: doctor._id, serviceId: selectedServiceId, appointmentDate, appointmentTime, notes });
      Alert.alert('Appointment Booked', 'Your appointment has been successfully scheduled.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Booking appointment..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Book Appointment"
        subtitle={`with ${doctor.name}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Doctor summary */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>{doctor.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View style={styles.doctorText}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
            <Text style={styles.doctorFee}>${doctor.consultationFee} consultation</Text>
          </View>
        </View>

        {/* Service selection */}
        <Text style={styles.sectionLabel}>SELECT SERVICE</Text>
        {services.length === 0 ? (
          <Text style={styles.noServices}>No services available</Text>
        ) : (
          services.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.serviceItem, selectedServiceId === item._id && styles.serviceItemSelected]}
              onPress={() => setSelectedServiceId(item._id)}
              activeOpacity={0.8}
            >
              <View style={styles.serviceLeft}>
                <View style={[styles.radio, selectedServiceId === item._id && styles.radioSelected]}>
                  {selectedServiceId === item._id ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.serviceRadioRight}>
                  <Text style={[styles.serviceName, selectedServiceId === item._id && styles.serviceNameSelected]}>
                    {item.serviceName}
                  </Text>
                  <Text style={styles.serviceMeta}>{item.duration} min</Text>
                </View>
              </View>
              <Text style={[styles.servicePrice, selectedServiceId === item._id && styles.servicePriceSelected]}>
                ${item.price}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionLabel}>CHOOSE DATE</Text>
        <View style={styles.calendarCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
            {availableDates.map((date) => {
              const selected = date.value === appointmentDate;
              return (
                <TouchableOpacity
                  key={date.value}
                  style={[styles.dateItem, selected && styles.dateItemSelected]}
                  onPress={() => setAppointmentDate(date.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDay, selected && styles.dateDaySelected]}>{date.day}</Text>
                  <Text style={[styles.dateNumber, selected && styles.dateNumberSelected]}>{date.dayNumber}</Text>
                  <Text style={[styles.dateMonth, selected && styles.dateMonthSelected]}>{date.month}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Text style={styles.sectionLabel}>SELECT TIME SLOT</Text>
        <View style={styles.doctorHoursInfo}>
          <Text style={styles.hoursLabel}>Doctor available: {doctorAvailability.startTime} - {doctorAvailability.endTime}</Text>
        </View>
        {slotsLoading ? (
          <View style={styles.slotCard}>
            <Text style={styles.loadingText}>Loading available slots...</Text>
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.slotCard}>
            <Text style={styles.noSlotsText}>No slots for this date. Please choose another date.</Text>
          </View>
        ) : (
          <View style={styles.slotCard}>
            {slots.map((slot) => {
              const isSelected = slot.time === appointmentTime;
              const isBooked = slot.isBooked;

              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[
                    styles.slotItem,
                    isSelected && styles.slotItemSelected,
                    isBooked && styles.slotItemBooked,
                  ]}
                  onPress={() => {
                    if (isBooked) {
                      setSelectedBookedSlot(slot.time);
                      setBookedSlotModalVisible(true);
                    } else {
                      setAppointmentTime(slot.time);
                    }
                  }}
                  activeOpacity={isBooked ? 0.6 : 0.8}
                >
                  <Text
                    style={[
                      styles.slotText,
                      isSelected && styles.slotTextSelected,
                      isBooked && styles.slotTextBooked,
                    ]}
                  >
                    {slot.time}
                  </Text>
                  {slot.endTime && (
                    <Text
                      style={[
                        styles.slotDurationText,
                        isSelected && styles.slotDurationTextSelected,
                        isBooked && styles.slotDurationTextBooked,
                      ]}
                    >
                      {slot.endTime} ({isBooked && slot.actualDuration ? slot.actualDuration : slot.duration}m)
                    </Text>
                  )}
                  {isBooked && <Text style={styles.bookedLabel}>Booked</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.formCard}>
          <CustomInput label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any special instructions..." multiline numberOfLines={3} />
        </View>

        <CustomButton title="Confirm Booking" onPress={handleBook} style={styles.bookBtn} />
      </ScrollView>

      {/* Booked Slot Modal */}
      <Modal
        visible={bookedSlotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setBookedSlotModalVisible(false);
          setNotifyMeChecked(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Slot Not Available</Text>
            <Text style={styles.modalMessage}>
              The slot {selectedBookedSlot} is already booked. Would you like to be notified when it becomes available?
            </Text>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, notifyMeChecked && { backgroundColor: COLORS.tealStrong, borderColor: COLORS.tealStrong }]}
                onPress={() => setNotifyMeChecked(!notifyMeChecked)}
              >
                {notifyMeChecked && <Text style={styles.checkmarkText}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNotifyMeChecked(!notifyMeChecked)} style={{ flex: 1 }}>
                <Text style={styles.checkboxLabel}>Notify me when this slot is available</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setBookedSlotModalVisible(false);
                  setNotifyMeChecked(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.notifyButton, waitlistLoading && styles.notifyButtonDisabled]}
                onPress={handleNotifyMe}
                disabled={waitlistLoading || !notifyMeChecked}
              >
                <Text style={styles.notifyButtonText}>
                  {waitlistLoading ? 'Adding...' : 'Add to Waitlist'}
                </Text>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 10, marginLeft: 4, marginTop: 8 },

  doctorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 20, ...SHADOW.card,
  },
  doctorText: { marginLeft: 14 },
  doctorAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.tealBright, alignItems: 'center', justifyContent: 'center',
  },
  doctorAvatarText: { fontSize: 20, fontWeight: FONTS.bold, color: COLORS.white },
  doctorName: { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.navyDeep },
  doctorSpec: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  doctorFee: { fontSize: 12, color: COLORS.tealStrong, marginTop: 2, fontWeight: FONTS.semibold },

  serviceItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.divider,
    padding: 14, marginVertical: 4, ...SHADOW.card,
  },
  serviceItemSelected: { borderColor: COLORS.tealStrong, backgroundColor: COLORS.tealFaint },
  serviceLeft: { flexDirection: 'row', alignItems: 'center' },
  serviceRadioRight: { marginLeft: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.tealPale,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.tealStrong },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.tealStrong },
  serviceName: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.navyDeep },
  serviceNameSelected: { color: COLORS.tealStrong },
  serviceMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  servicePrice: { fontSize: 14, fontWeight: FONTS.bold, color: COLORS.textMuted },
  servicePriceSelected: { color: COLORS.tealStrong },
  noServices: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 16 },

  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
    ...SHADOW.card,
  },
  calendarRow: { paddingVertical: 2 },
  dateItem: {
    width: 80,
    minHeight: 100,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgMuted,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  dateItemSelected: {
    backgroundColor: COLORS.tealStrong,
  },
  dateDay: { fontSize: 11, fontWeight: FONTS.bold, color: COLORS.textSecondary, textTransform: 'uppercase' },
  dateDaySelected: { color: COLORS.white },
  dateNumber: { fontSize: 18, fontWeight: FONTS.bold, color: COLORS.navyDeep, marginTop: 6 },
  dateNumberSelected: { color: COLORS.white },
  dateMonth: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  dateMonthSelected: { color: COLORS.white },

  doctorHoursInfo: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.tealStrong,
    ...SHADOW.card,
  },
  hoursLabel: {
    fontSize: 13,
    color: COLORS.navyDeep,
    fontWeight: FONTS.semibold,
  },

  slotCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    ...SHADOW.card,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noSlotsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 20,
  },
  slotItem: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgMuted,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotItemSelected: {
    backgroundColor: COLORS.tealStrong,
  },
  slotItemBooked: {
    backgroundColor: '#E8E8E8',
    opacity: 0.6,
  },
  slotText: { color: COLORS.textPrimary, fontWeight: FONTS.medium },
  slotTextSelected: { color: COLORS.white },
  slotTextBooked: { color: COLORS.textMuted },
  slotDurationText: { 
    fontSize: 10, 
    color: COLORS.textMuted, 
    fontWeight: FONTS.regular,
    marginTop: 2,
  },
  slotDurationTextSelected: { 
    color: COLORS.white,
  },
  slotDurationTextBooked: { 
    color: COLORS.textSecondary,
  },
  bookedLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: FONTS.bold,
    marginTop: 2,
  },

  formCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 16, ...SHADOW.card,
  },
  bookBtn: { marginTop: 8 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.navyDeep,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.navyDeep,
    marginLeft: 12,
    fontWeight: FONTS.medium,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.bgMuted,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
  },
  notifyButton: {
    backgroundColor: COLORS.tealStrong,
  },
  notifyButtonDisabled: {
    backgroundColor: COLORS.tealPale,
    opacity: 0.6,
  },
  notifyButtonText: {
    fontSize: 14,
    fontWeight: FONTS.semibold,
    color: COLORS.white,
  },
});

export default AppointmentBookingScreen;