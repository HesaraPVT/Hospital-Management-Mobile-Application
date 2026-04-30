/*import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { createServiceApi, updateServiceApi } from '../../api/serviceApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const ServiceFormScreen = ({ route, navigation }) => {
  const { service } = route.params || {};
  const [serviceName, setServiceName] = useState(service?.serviceName || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(
    service?.availabilityStatus !== undefined ? Boolean(service.availabilityStatus) : true
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!serviceName || !description || !price || !duration) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const data = {
        serviceName, description,
        price: parseFloat(price),
        duration: parseInt(duration),
        availabilityStatus,
      };
      service ? await updateServiceApi(service._id, data) : await createServiceApi(data);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message={service ? 'Updating service...' : 'Creating service...'} />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={service ? 'Edit Service' : 'Add Service'}
        subtitle={service ? 'Update service details' : 'Create a new hospital service'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>SERVICE INFORMATION</Text>
        <View style={styles.formCard}>
          <CustomInput label="Service Name" value={serviceName} onChangeText={setServiceName} placeholder="e.g. General Consultation" />
          <CustomInput label="Description" value={description} onChangeText={setDescription} placeholder="Describe what this service includes..." multiline numberOfLines={4} />
          <CustomInput label="Price (LKR)" value={price} onChangeText={setPrice} placeholder="e.g. 1500" keyboardType="numeric" />
          <CustomInput label="Duration (minutes)" value={duration} onChangeText={setDuration} placeholder="e.g. 30" keyboardType="numeric" />
        </View>

        <Text style={styles.sectionLabel}>AVAILABILITY</Text>
        <View style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleLabel}>Mark as Available</Text>
            <Text style={styles.toggleSub}>Patients can select this service</Text>
          </View>
          <Switch
            value={availabilityStatus}
            onValueChange={setAvailabilityStatus}
            trackColor={{ false: COLORS.tealPale, true: COLORS.tealBright }}
            thumbColor={COLORS.white}
          />
        </View>

        <CustomButton title={service ? 'Update Service' : 'Create Service'} onPress={handleSubmit} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, fontWeight: FONTS.bold, color: COLORS.tealBright, letterSpacing: 2, marginBottom: 10, marginLeft: 4, marginTop: 4 },
  formCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 16, ...SHADOW.card,
  },
  toggleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 20, ...SHADOW.card,
  },
  toggleLabel: { fontSize: 14, fontWeight: FONTS.semibold, color: COLORS.navyDeep },
  toggleSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});

export default ServiceFormScreen;*/



/*import React, { useReducer, useState } from 'react';
import { View, Text, StyleSheet, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { createServiceApi, updateServiceApi } from '../../api/serviceApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

// Initial state and Reducer function to handle form data
const formReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        default:
            return state;
    }
};

const ServiceFormScreen = ({ route, navigation }) => {
    const { service } = route.params || {};
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Using useReducer for complex state management
    const [formData, dispatch] = useReducer(formReducer, {
        serviceName: service?.serviceName || '',
        description: service?.description || '',
        price: service?.price?.toString() || '',
        duration: service?.duration?.toString() || '',
        availabilityStatus: service?.availabilityStatus ?? true,
    });

    const handleInputChange = (field, value) => {
        dispatch({ type: 'UPDATE_FIELD', field, value });
    };

    const processForm = async () => {
        const { serviceName, description, price, duration, availabilityStatus } = formData;

        // Validation logic
        if (!serviceName.trim() || !description.trim() || !price || !duration) {
            return Alert.alert('Attention', 'All medical service fields are mandatory.');
        }

        setIsSubmitting(true);
        try {
            const payload = {
                serviceName,
                description,
                price: Number(price),
                duration: Number(duration),
                availabilityStatus,
            };

            if (service?._id) {
                await updateServiceApi(service._id, payload);
            } else {
                await createServiceApi(payload);
            }

            navigation.goBack();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to sync with the hospital server.';
            Alert.alert('System Error', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <LoadingSpinner message="Processing Request..." />;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScreenHeader
                title={service ? 'Modify Service' : 'New Service'}
                subtitle={service ? 'Adjust current department offerings' : 'Register a new clinical service'}
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.contentArea} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerLabel}>SERVICE DETAILS</Text>
                
                <View style={styles.inputGroup}>
                    <CustomInput 
                        label="Service Title" 
                        value={formData.serviceName} 
                        onChangeText={(val) => handleInputChange('serviceName', val)} 
                    />
                    <CustomInput 
                        label="Detailed Description" 
                        value={formData.description} 
                        onChangeText={(val) => handleInputChange('description', val)} 
                        multiline 
                    />
                    <CustomInput 
                        label="Cost (LKR)" 
                        value={formData.price} 
                        onChangeText={(val) => handleInputChange('price', val)} 
                        keyboardType="decimal-pad" 
                    />
                    <CustomInput 
                        label="Time Required (mins)" 
                        value={formData.duration} 
                        onChangeText={(val) => handleInputChange('duration', val)} 
                        keyboardType="number-pad" 
                    />
                </View>

                <Text style={styles.headerLabel}>STATUS SETTINGS</Text>
                
                <View style={styles.statusBox}>
                    <View style={styles.textColumn}>
                        <Text style={styles.mainTitle}>Active Availability</Text>
                        <Text style={styles.subTitle}>Enable for patient bookings</Text>
                    </View>
                    <Switch
                        value={formData.availabilityStatus}
                        onValueChange={(val) => handleInputChange('availabilityStatus', val)}
                        trackColor={{ false: COLORS.tealPale, true: COLORS.tealBright }}
                        thumbColor={COLORS.white}
                    />
                </View>

                <CustomButton 
                    title={service ? 'Save Changes' : 'Confirm Registration'} 
                    onPress={processForm} 
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgPage },
    contentArea: { padding: 20, paddingBottom: 50 },
    headerLabel: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        color: COLORS.tealBright, 
        letterSpacing: 1.5, 
        marginBottom: 12, 
        textTransform: 'uppercase' 
    },
    inputGroup: {
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.md,
        padding: 18, 
        marginBottom: 20, 
        ...SHADOW.card,
    },
    statusBox: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.md,
        padding: 18, 
        marginBottom: 25, 
        ...SHADOW.card,
    },
    textColumn: { flex: 1 },
    mainTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.navyDeep },
    subTitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
});

export default ServiceFormScreen;*/





/*import React, { useReducer, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Alert, 
    Switch, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    Pressable // Added Pressable to the imports
} from 'react-native';
import { createServiceApi, updateServiceApi, deleteServiceApi } from '../../api/serviceApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

// Initial state and Reducer function to handle form data
const formReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        default:
            return state;
    }
};

const ServiceFormScreen = ({ route, navigation }) => {
    const { service } = route.params || {};
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Using useReducer for complex state management
    const [formData, dispatch] = useReducer(formReducer, {
        serviceName: service?.serviceName || '',
        description: service?.description || '',
        price: service?.price?.toString() || '',
        duration: service?.duration?.toString() || '',
        availabilityStatus: service?.availabilityStatus ?? true,
    });

    const handleInputChange = (field, value) => {
        dispatch({ type: 'UPDATE_FIELD', field, value });
    };

    // Function to handle service deletion
    const handleDelete = () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to remove this medical service? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            await deleteServiceApi(service._id);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete the service. Please try again.");
                        } finally {
                            setIsSubmitting(false);
                        }
                    } 
                }
            ]
        );
    };

    const processForm = async () => {
        const { serviceName, description, price, duration, availabilityStatus } = formData;

        // Validation logic
        if (!serviceName.trim() || !description.trim() || !price || !duration) {
            return Alert.alert('Attention', 'All medical service fields are mandatory.');
        }

        setIsSubmitting(true);
        try {
            const payload = {
                serviceName,
                description,
                price: Number(price),
                duration: Number(duration),
                availabilityStatus,
            };

            if (service?._id) {
                await updateServiceApi(service._id, payload);
            } else {
                await createServiceApi(payload);
            }

            navigation.goBack();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to sync with the hospital server.';
            Alert.alert('System Error', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <LoadingSpinner message="Processing Request..." />;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScreenHeader
                title={service ? 'Modify Service' : 'New Service'}
                subtitle={service ? 'Adjust current department offerings' : 'Register a new clinical service'}
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.contentArea} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerLabel}>SERVICE DETAILS</Text>
                
                <View style={styles.inputGroup}>
                    <CustomInput 
                        label="Service Title" 
                        value={formData.serviceName} 
                        onChangeText={(val) => handleInputChange('serviceName', val)} 
                    />
                    <CustomInput 
                        label="Detailed Description" 
                        value={formData.description} 
                        onChangeText={(val) => handleInputChange('description', val)} 
                        multiline 
                    />
                    <CustomInput 
                        label="Cost (LKR)" 
                        value={formData.price} 
                        onChangeText={(val) => handleInputChange('price', val)} 
                        keyboardType="decimal-pad" 
                    />
                    <CustomInput 
                        label="Time Required (mins)" 
                        value={formData.duration} 
                        onChangeText={(val) => handleInputChange('duration', val)} 
                        keyboardType="number-pad" 
                    />
                </View>

                <Text style={styles.headerLabel}>STATUS SETTINGS</Text>
                
                <View style={styles.statusBox}>
                    <View style={styles.textColumn}>
                        <Text style={styles.mainTitle}>Active Availability</Text>
                        <Text style={styles.subTitle}>Enable for patient bookings</Text>
                    </View>
                    <Switch
                        value={formData.availabilityStatus}
                        onValueChange={(val) => handleInputChange('availabilityStatus', val)}
                        trackColor={{ false: COLORS.tealPale, true: COLORS.tealBright }}
                        thumbColor={COLORS.white}
                    />
                </View>

                <CustomButton 
                    title={service ? 'Save Changes' : 'Confirm Registration'} 
                    onPress={processForm} 
                />

                {/* Delete Button - Only renders if editing an existing service *//*}
                {service?._id && (
                    <Pressable 
                        onPress={handleDelete}
                        style={({ pressed }) => [
                            styles.deleteButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        <Text style={styles.deleteText}>Delete Service</Text>
                    </Pressable>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgPage },
    contentArea: { padding: 20, paddingBottom: 50 },
    headerLabel: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        color: COLORS.tealBright, 
        letterSpacing: 1.5, 
        marginBottom: 12, 
        textTransform: 'uppercase' 
    },
    inputGroup: {
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.md,
        padding: 18, 
        marginBottom: 20, 
        ...SHADOW.card,
    },
    statusBox: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.md,
        padding: 18, 
        marginBottom: 25, 
        ...SHADOW.card,
    },
    textColumn: { flex: 1 },
    mainTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.navyDeep },
    subTitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
    deleteButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteText: {
        color: '#FF3B30', // Error Red
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ServiceFormScreen;*/





import React, { useReducer, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Alert, 
    Switch, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    Pressable,
    TouchableOpacity // Added for category selection
} from 'react-native';
import { createServiceApi, updateServiceApi, deleteServiceApi } from '../../api/serviceApi';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

// Available categories for the Hospital System
const CATEGORIES = ['Laboratory', 'Radiology', 'Consultation', 'General', 'Emergency'];

const formReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        default:
            return state;
    }
};

const ServiceFormScreen = ({ route, navigation }) => {
    const { service } = route.params || {};
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, dispatch] = useReducer(formReducer, {
        serviceName: service?.serviceName || '',
        description: service?.description || '',
        price: service?.price?.toString() || '',
        duration: service?.duration?.toString() || '',
        availabilityStatus: service?.availabilityStatus ?? true,
        category: service?.category || 'General', // Added category to state
    });

    const handleInputChange = (field, value) => {
        dispatch({ type: 'UPDATE_FIELD', field, value });
    };

    const handleDelete = () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to remove this medical service? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            await deleteServiceApi(service._id);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete the service.");
                        } finally {
                            setIsSubmitting(false);
                        }
                    } 
                }
            ]
        );
    };

    const processForm = async () => {
        const { serviceName, description, price, duration, availabilityStatus, category } = formData;

        if (!serviceName.trim() || !description.trim() || !price || !duration) {
            return Alert.alert('Attention', 'All medical service fields are mandatory.');
        }

        setIsSubmitting(true);
        try {
            const payload = {
                serviceName,
                description,
                price: Number(price),
                duration: Number(duration),
                availabilityStatus,
                category, // Included in the payload
            };

            if (service?._id) {
                await updateServiceApi(service._id, payload);
            } else {
                await createServiceApi(payload);
            }

            navigation.goBack();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to sync with the hospital server.';
            Alert.alert('System Error', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <LoadingSpinner message="Processing Request..." />;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScreenHeader
                title={service ? 'Modify Service' : 'New Service'}
                subtitle={service ? 'Adjust current department offerings' : 'Register a new clinical service'}
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.contentArea} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerLabel}>SERVICE DETAILS</Text>
                
                <View style={styles.inputGroup}>
                    <CustomInput 
                        label="Service Title" 
                        value={formData.serviceName} 
                        onChangeText={(val) => handleInputChange('serviceName', val)} 
                    />
                    
                    {/* Category Selection Section */}
                    <Text style={styles.inlineLabel}>Department Category</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.catChip,
                                    formData.category === cat && styles.activeCatChip
                                ]}
                                onPress={() => handleInputChange('category', cat)}
                            >
                                <Text style={[
                                    styles.catText,
                                    formData.category === cat && styles.activeCatText
                                ]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <CustomInput 
                        label="Detailed Description" 
                        value={formData.description} 
                        onChangeText={(val) => handleInputChange('description', val)} 
                        multiline 
                    />
                    <CustomInput 
                        label="Cost (LKR)" 
                        value={formData.price} 
                        onChangeText={(val) => handleInputChange('price', val)} 
                        keyboardType="decimal-pad" 
                    />
                    <CustomInput 
                        label="Time Required (mins)" 
                        value={formData.duration} 
                        onChangeText={(val) => handleInputChange('duration', val)} 
                        keyboardType="number-pad" 
                    />
                </View>

                <Text style={styles.headerLabel}>STATUS SETTINGS</Text>
                
                <View style={styles.statusBox}>
                    <View style={styles.textColumn}>
                        <Text style={styles.mainTitle}>Active Availability</Text>
                        <Text style={styles.subTitle}>Enable for patient bookings</Text>
                    </View>
                    <Switch
                        value={formData.availabilityStatus}
                        onValueChange={(val) => handleInputChange('availabilityStatus', val)}
                        trackColor={{ false: COLORS.tealPale, true: COLORS.tealBright }}
                        thumbColor={COLORS.white}
                    />
                </View>

                <CustomButton 
                    title={service ? 'Save Changes' : 'Confirm Registration'} 
                    onPress={processForm} 
                />

                {service?._id && (
                    <Pressable 
                        onPress={handleDelete}
                        style={({ pressed }) => [
                            styles.deleteButton,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        <Text style={styles.deleteText}>Delete Service</Text>
                    </Pressable>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgPage },
    contentArea: { padding: 20, paddingBottom: 50 },
    headerLabel: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        color: COLORS.tealBright, 
        letterSpacing: 1.5, 
        marginBottom: 12, 
        textTransform: 'uppercase' 
    },
    inputGroup: {
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.md,
        padding: 18, 
        marginBottom: 20, 
        ...SHADOW.card,
    },
    inlineLabel: {
        fontSize: 13,
        color: COLORS.navyDeep,
        fontWeight: FONTS.semibold,
        marginTop: 10,
        marginBottom: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    catChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.tealPale,
        backgroundColor: COLORS.white,
    },
    activeCatChip: {
        backgroundColor: COLORS.tealBright,
        borderColor: COLORS.tealBright,
    },
    catText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    activeCatText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    statusBox: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.md,
        padding: 18, 
        marginBottom: 25, 
        ...SHADOW.card,
    },
    textColumn: { flex: 1 },
    mainTitle: { fontSize: 15, fontWeight: FONTS.semibold, color: COLORS.navyDeep },
    subTitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
    deleteButton: {
        marginTop: 20,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ServiceFormScreen;