import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { searchPatientsApi } from '../../api/medicalReportApi';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const PatientSearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            Alert.alert('Enter Search Query', 'Please enter a Patient ID, name, phone, or NIC number.');
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await searchPatientsApi(searchQuery);
            setPatients(res.data);
            if (res.data.length === 0) {
                Alert.alert('No Patients Found', 'Try searching with different criteria.');
            }
        } catch (error) {
            Alert.alert('Search Failed', error.response?.data?.message || 'Could not search patients.');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    const handleSelectPatient = (patient) => {
        navigation.navigate('PatientConfirmation', { patient });
    };

    const renderPatientCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.patientCard, SHADOW.sm]}
            onPress={() => handleSelectPatient(item)}
            activeOpacity={0.8}
        >
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    {item.profileImage ? (
                        <Image
                            source={{ uri: item.profileImage }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: COLORS.tealBright }]}>
                            <Text style={styles.avatarText}>
                                {item.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{item.name}</Text>
                    <Text style={styles.patientDetail}>Patient ID: {item.patientID}</Text>
                    <Text style={styles.patientDetail}>Phone: {item.phone || 'N/A'}</Text>
                    {item.dateOfBirth && (
                        <Text style={styles.patientDetail}>
                            DOB: {new Date(item.dateOfBirth).toLocaleDateString()}
                        </Text>
                    )}
                </View>
                <View style={styles.selectButton}>
                    <Text style={styles.selectIcon}>›</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="Search Patient"
                subtitle="Find patient by ID, name, phone, or NIC"
                onBack={() => navigation.goBack()}
            />

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Patient ID, name, phone, or NIC..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.gray}
                    editable={!loading}
                />
                <TouchableOpacity
                    style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                    onPress={handleSearch}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                        <Text style={styles.searchButtonText}>Search</Text>
                    )}
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.tealBright} />
                </View>
            )}

            {!loading && searched && patients.length === 0 && (
                <View style={styles.centerContainer}>
                    <Text style={styles.noResultsText}>No patients found</Text>
                    <Text style={styles.noResultsSubText}>Try a different search term</Text>
                </View>
            )}

            {!loading && patients.length > 0 && (
                <FlatList
                    data={patients}
                    keyExtractor={(item) => item._id}
                    renderItem={renderPatientCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {!searched && (
                <View style={styles.centerContainer}>
                    <Text style={styles.instructionText}>Enter patient details to search</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 12,
        paddingVertical: 10,
        ...FONTS.body3,
        color: COLORS.text,
    },
    searchButton: {
        backgroundColor: COLORS.tealBright,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonDisabled: {
        opacity: 0.6,
    },
    searchButtonText: {
        color: COLORS.white,
        ...FONTS.body3_bold,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    listContent: {
        padding: 15,
        paddingBottom: 30,
    },
    patientCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.white,
        ...FONTS.body2_bold,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        ...FONTS.body2_bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    patientDetail: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginBottom: 2,
    },
    selectButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectIcon: {
        fontSize: 24,
        color: COLORS.tealBright,
    },
    noResultsText: {
        ...FONTS.body2_bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    noResultsSubText: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    instructionText: {
        ...FONTS.body2,
        color: COLORS.gray,
    },
});

export default PatientSearchScreen;
