import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { uploadMedicalReportApi } from '../../api/medicalReportApi';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const REPORT_TYPES = [
    'X-ray',
    'ECG',
    'MRI',
    'CT scan',
    'Blood test',
    'Ultrasound',
    'Other'
];

const ReportUploadScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [reportType, setReportType] = useState('');
    const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);
    const [doctorName, setDoctorName] = useState('');
    const [description, setDescription] = useState('');
    const [reportFile, setReportFile] = useState('');
    const [fileType, setFileType] = useState('pdf');
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validateForm = () => {
        if (!reportType.trim()) {
            Alert.alert('Required', 'Please select a report type');
            return false;
        }
        if (!scanDate.trim()) {
            Alert.alert('Required', 'Please enter scan date');
            return false;
        }
        if (!doctorName.trim()) {
            Alert.alert('Required', 'Please enter doctor name');
            return false;
        }
        if (!reportFile.trim()) {
            Alert.alert('Required', 'Please upload a report file');
            return false;
        }
        return true;
    };

    const handleSelectFile = async () => {
        // This would typically use react-native-document-picker or react-native-image-picker
        // For now, we'll show a placeholder implementation
        Alert.alert('File Upload', 'File picker integration needed');
        // In a real app:
        // const result = await DocumentPicker.pick({...});
        // setReportFile(result.uri);
    };

    const handleUpload = async () => {
        if (!validateForm()) return;

        setUploading(true);
        try {
            const uploadData = {
                patientId: patient._id,
                reportType,
                scanDate: new Date(scanDate).toISOString(),
                doctorName: doctorName.trim(),
                description: description.trim(),
                reportFile, // In production, this would be a base64 or file URI
                fileType
            };

            const res = await uploadMedicalReportApi(uploadData);

            Alert.alert(
                'Success',
                'Medical report uploaded successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back to patient search or admin dashboard
                            navigation.navigate('PatientSearch');
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert(
                'Upload Failed',
                error.response?.data?.message || 'Could not upload report'
            );
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel Upload',
            'Are you sure you want to cancel? All entered data will be lost.',
            [
                { text: 'Continue Editing', onPress: () => { } },
                {
                    text: 'Cancel',
                    onPress: () => navigation.goBack(),
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="Upload Report"
                subtitle={`Patient: ${patient.name}`}
                onBack={handleCancel}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Patient Quick Info */}
                <View style={[styles.infoBox, SHADOW.sm]}>
                    <Text style={styles.infoLabel}>Uploading for:</Text>
                    <Text style={styles.infoValue}>{patient.name}</Text>
                    <Text style={styles.infoSubtext}>ID: {patient.patientID}</Text>
                </View>

                {/* Report Type */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Report Type <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.dropdown, SHADOW.sm]}
                        onPress={() => setShowTypeMenu(!showTypeMenu)}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.dropdownText, !reportType && styles.placeholderText]}>
                            {reportType || 'Select report type...'}
                        </Text>
                        <Text style={styles.dropdownIcon}>{showTypeMenu ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {showTypeMenu && (
                        <View style={[styles.dropdownMenu, SHADOW.md]}>
                            {REPORT_TYPES.map((type, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setReportType(type);
                                        setShowTypeMenu(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            reportType === type && styles.dropdownItemTextSelected
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Scan Date */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Scan Date <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={scanDate}
                        onChangeText={setScanDate}
                        placeholderTextColor={COLORS.gray}
                        editable={!uploading}
                    />
                    <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
                </View>

                {/* Doctor Name */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Doctor Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter doctor name"
                        value={doctorName}
                        onChangeText={setDoctorName}
                        placeholderTextColor={COLORS.gray}
                        editable={!uploading}
                    />
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description/Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Add any notes or description about the report..."
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor={COLORS.gray}
                        multiline
                        numberOfLines={4}
                        editable={!uploading}
                        textAlignVertical="top"
                    />
                </View>

                {/* File Type Selection */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>File Type</Text>
                    <View style={styles.fileTypeContainer}>
                        {['pdf', 'image'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.fileTypeButton,
                                    fileType === type && styles.fileTypeButtonSelected
                                ]}
                                onPress={() => setFileType(type)}
                                activeOpacity={0.85}
                            >
                                <Text
                                    style={[
                                        styles.fileTypeButtonText,
                                        fileType === type && styles.fileTypeButtonTextSelected
                                    ]}
                                >
                                    {type.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* File Upload */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        Upload Report File <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.uploadButton, SHADOW.sm]}
                        onPress={handleSelectFile}
                        disabled={uploading}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.uploadButtonIcon}>📎</Text>
                        <View style={styles.uploadButtonContent}>
                            <Text style={styles.uploadButtonText}>
                                {reportFile ? 'File Selected' : 'Choose File to Upload'}
                            </Text>
                            <Text style={styles.uploadButtonSubtext}>
                                {reportFile || `Select a ${fileType.toUpperCase()} file`}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <View style={styles.termsBox}>
                    <Text style={styles.termsText}>
                        ✓ Ensure the report belongs to the selected patient
                    </Text>
                    <Text style={styles.termsText}>
                        ✓ Report file format must be valid
                    </Text>
                    <Text style={styles.termsText}>
                        ✓ Patient will receive notification after upload
                    </Text>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={uploading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.uploadActionButton, uploading && styles.uploadButtonDisabled]}
                    onPress={handleUpload}
                    disabled={uploading}
                    activeOpacity={0.85}
                >
                    {uploading ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                        <Text style={styles.uploadActionButtonText}>Upload Report</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 20,
    },
    infoBox: {
        backgroundColor: COLORS.tealFaint,
        borderRadius: RADIUS.md,
        padding: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.tealBright,
    },
    infoLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginBottom: 4,
    },
    infoValue: {
        ...FONTS.body2_bold,
        color: COLORS.tealBright,
        marginBottom: 2,
    },
    infoSubtext: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        ...FONTS.body2_bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    required: {
        color: COLORS.danger,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        ...FONTS.body3,
        color: COLORS.text,
        backgroundColor: COLORS.white,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    hint: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginTop: 4,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    dropdownText: {
        ...FONTS.body3,
        color: COLORS.text,
        flex: 1,
    },
    placeholderText: {
        color: COLORS.gray,
    },
    dropdownIcon: {
        fontSize: 12,
        color: COLORS.gray,
    },
    dropdownMenu: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.white,
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    dropdownItemText: {
        ...FONTS.body3,
        color: COLORS.text,
    },
    dropdownItemTextSelected: {
        color: COLORS.tealBright,
        ...FONTS.body3_bold,
    },
    fileTypeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    fileTypeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    fileTypeButtonSelected: {
        borderColor: COLORS.tealBright,
        backgroundColor: COLORS.tealFaint,
    },
    fileTypeButtonText: {
        ...FONTS.body3_bold,
        color: COLORS.gray,
    },
    fileTypeButtonTextSelected: {
        color: COLORS.tealBright,
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: COLORS.tealBright,
        borderRadius: RADIUS.md,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.tealFaint,
    },
    uploadButtonIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    uploadButtonContent: {
        flex: 1,
    },
    uploadButtonText: {
        ...FONTS.body3_bold,
        color: COLORS.tealBright,
    },
    uploadButtonSubtext: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginTop: 2,
    },
    termsBox: {
        backgroundColor: '#F0F8FF',
        borderRadius: RADIUS.md,
        padding: 15,
        marginTop: 10,
    },
    termsText: {
        ...FONTS.body3,
        color: '#01579B',
        marginBottom: 6,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 15,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.lightGray,
    },
    cancelButtonText: {
        ...FONTS.body2_bold,
        color: COLORS.text,
    },
    uploadActionButton: {
        backgroundColor: COLORS.success,
    },
    uploadActionButtonText: {
        ...FONTS.body2_bold,
        color: COLORS.white,
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
});

export default ReportUploadScreen;
