# Medical Report Management System - Integration Guide

## Overview
Complete implementation of the Medical Report Management System with patient search, confirmation, upload, and viewing functionality.

## Backend Implementation

### 1. Updated Components

#### User Model (`src/models/user.model.js`)
- Added `patientID`: Unique identifier generated automatically for patients
- Added `nic`: National ID/Passport number
- Added `dateOfBirth`: Patient's date of birth
- Auto-generates unique Patient IDs on patient registration

#### New Medical Report Model (`src/models/medicalReport.model.js`)
Fields:
- `patient`: Reference to User document
- `patientID`: Patient's unique ID (indexed for fast search)
- `reportType`: Enum - X-ray, ECG, MRI, CT scan, Blood test, Ultrasound, Other
- `scanDate`: Date when scan was performed
- `doctorName`: Name of attending doctor
- `description`: Notes and additional information
- `reportFile`: File path/URI
- `fileType`: Either 'pdf' or 'image'
- `uploadedBy`: Admin user who uploaded the report
- `isViewed`: Boolean tracking if patient has viewed report
- `viewedAt`: Timestamp when patient viewed report

#### Medical Report Controller (`src/controllers/medicalReport.controller.js`)
Available endpoints:
- `searchPatients()` - Search patients by ID, name, phone, NIC
- `getPatientDetails()` - Get patient information
- `uploadMedicalReport()` - Upload new report
- `getPatientReports()` - Get all reports for a patient
- `getMedicalReportById()` - Get specific report details
- `updateMedicalReport()` - Update report information (admin only)
- `deleteMedicalReport()` - Delete report (admin only)
- `getAllPatientReportsBySearch()` - Search all reports across patients

#### Medical Report Routes (`src/routes/medicalReport.routes.js`)
Base path: `/api/medical-reports`

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| GET | `/search/patients?query=` | ✓ | Admin | Search patients |
| GET | `/patient/:patientId/details` | ✓ | All | Get patient details |
| POST | `/upload` | ✓ | Admin | Upload report |
| GET | `/patient/:patientId` | ✓ | Patient/Admin | Get patient reports |
| GET | `/:reportId` | ✓ | Patient/Admin | Get report details |
| PUT | `/:reportId` | ✓ | Admin | Update report |
| DELETE | `/:reportId` | ✓ | Admin | Delete report |
| GET | `/search/all` | ✓ | Admin | Search all reports |

### 2. Integration Steps

1. **Install dependencies** (if needed):
   ```bash
   npm install crypto
   ```

2. **Update app.js** (already done):
   - Imported `medicalReportRoutes`
   - Added route: `app.use('/api/medical-reports', medicalReportRoutes);`

3. **Database Migration**:
   - Existing users: Run update to add patientID (generate for all patients)
   - New registrations: patientID auto-generates in pre-save hook

4. **Test endpoints** using Postman/Insomnia:
   ```
   GET /api/medical-reports/search/patients?query=john
   POST /api/medical-reports/upload
   GET /api/medical-reports/patient/:userId
   ```

---

## Mobile App Implementation

### 1. New API Functions (`src/api/medicalReportApi.js`)
```javascript
- searchPatientsApi(query)
- getPatientDetailsApi(patientId)
- uploadMedicalReportApi(data)
- getPatientReportsApi(patientId)
- getMedicalReportByIdApi(reportId)
- updateMedicalReportApi(reportId, data)
- deleteMedicalReportApi(reportId)
- searchPatientReportsApi(filters)
```

### 2. New Screens

#### Admin Screens
1. **PatientSearchScreen** (`src/screens/admin/PatientSearchScreen.js`)
   - Search patients by ID, name, phone, NIC
   - Display matching patients with details
   - Tap to select patient

2. **PatientConfirmationScreen** (`src/screens/admin/PatientConfirmationScreen.js`)
   - Verify patient details before upload
   - Show patient photo, name, ID, DOB, NIC
   - Alert message reminding to verify identity
   - Confirm or cancel buttons

3. **ReportUploadScreen** (`src/screens/admin/ReportUploadScreen.js`)
   - Form for report details
   - Report type dropdown (X-ray, ECG, MRI, CT scan, Blood test, Ultrasound, Other)
   - Scan date input
   - Doctor name input
   - Description/notes textarea
   - File type selection (PDF or Image)
   - File upload button
   - Submit and cancel buttons

#### Patient Screens
4. **MyReportsScreen** (`src/screens/common/MyReportsScreen.js`)
   - List all reports for current patient
   - Pull-to-refresh functionality
   - Show report type, scan date, doctor name
   - Mark new/unviewed reports
   - Display "NEW" badge for unviewed reports
   - Tap to view report details

5. **MyReportDetailScreen** (`src/screens/common/MyReportDetailScreen.js`)
   - Full report details display
   - Doctor name, upload date, file type
   - Notes and description section
   - File preview placeholder
   - Action buttons: Preview, Download, Share
   - Security message about data privacy

### 3. Navigation Integration

#### Update Admin Navigator
```javascript
// In src/screens/admin (or appropriate navigation file)
Stack.Screen name="PatientSearch" component={PatientSearchScreen}
Stack.Screen name="PatientConfirmation" component={PatientConfirmationScreen}
Stack.Screen name="ReportUpload" component={ReportUploadScreen}
```

#### Update Main/Common Navigator
```javascript
// In src/navigation/MainNavigator.js (or appropriate file)
// For patient report viewing
Stack.Screen name="MyReports" component={MyReportsScreen}
Stack.Screen name="MyReportDetail" component={MyReportDetailScreen}
```

#### Add Tab/Menu Item
Add navigation item in admin dashboard/menu:
```javascript
{
  label: "Medical Reports",
  icon: "📋",
  onPress: () => navigation.navigate('PatientSearch')
}
```

### 4. Integration Steps

1. **Import screens** in navigation files:
   ```javascript
   import PatientSearchScreen from '../screens/admin/PatientSearchScreen';
   import PatientConfirmationScreen from '../screens/admin/PatientConfirmationScreen';
   import ReportUploadScreen from '../screens/admin/ReportUploadScreen';
   import MyReportsScreen from '../screens/common/MyReportsScreen';
   import MyReportDetailScreen from '../screens/common/MyReportDetailScreen';
   ```

2. **Add to navigation stacks**:
   - Admin flow: PatientSearch → PatientConfirmation → ReportUpload
   - Patient flow: MyReports → MyReportDetail

3. **Update menu/tab navigation** to include "My Reports" for patients

4. **Test file upload** (implementation depends on device requirements):
   - For React Native Expo: Use `expo-document-picker` or `expo-image-picker`
   - For bare React Native: Use `react-native-document-picker` or `react-native-image-picker`
   - For web/managed: Implement appropriate file picker

### 5. File Upload Implementation

Currently, the ReportUploadScreen has a placeholder for file selection. To implement actual file uploads:

**Option 1: Using Expo (for managed projects)**
```bash
npm install expo-document-picker expo-image-picker
```

**Option 2: Using react-native-document-picker**
```bash
npm install react-native-document-picker
```

Example implementation:
```javascript
import DocumentPicker from 'react-native-document-picker';

const handleSelectFile = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
    });
    
    if (result) {
      // Convert to base64 or FormData
      const base64 = await FileSystem.readAsStringAsync(result.uri, { encoding: 'base64' });
      setReportFile(base64);
    }
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      Alert.alert('Error', 'Failed to select file');
    }
  }
};
```

---

## Workflow Summary

### Admin: Uploading a Report
1. Admin navigates to "Medical Reports" → "Patient Search"
2. Searches for patient using ID, name, phone, or NIC
3. Selects patient from results
4. Verifies patient details on confirmation screen
5. Confirms patient identity
6. Fills in report details:
   - Report type (dropdown)
   - Scan date
   - Doctor name
   - Description/notes
   - Selects and uploads file (PDF or image)
7. Submits form
8. Report is linked to patient using patientID
9. Patient receives notification

### Patient: Viewing Reports
1. Patient opens app and goes to "My Reports"
2. Sees list of available reports with:
   - Report type and scan date
   - Doctor name
   - Upload date
   - "NEW" badge if not viewed
3. Pulls down to refresh list
4. Taps on any report to view full details
5. Can preview, download, or share report
6. Report marked as viewed

---

## Database Queries

### Search Patients
```javascript
// Find by multiple fields
User.find({
  role: "patient",
  $or: [
    { patientID: new RegExp(query, 'i') },
    { name: new RegExp(query, 'i') },
    { phone: new RegExp(query, 'i') },
    { nic: new RegExp(query, 'i') }
  ]
});
```

### Get Patient Reports
```javascript
MedicalReport.find({ patient: patientId })
  .populate('uploadedBy', 'name email')
  .sort({ createdAt: -1 });
```

### Mark Report as Viewed
```javascript
const report = await MedicalReport.findById(reportId);
if (!report.isViewed) {
  report.isViewed = true;
  report.viewedAt = new Date();
  await report.save();
}
```

---

## Notifications (Future Implementation)

When report is uploaded, patient receives notification:
- Title: "New Medical Report"
- Message: "A new {reportType} report has been uploaded"
- Action: Opens "My Reports" screen

```javascript
// In upload controller, after report creation:
await Notification.create({
  patient: patientId,
  type: 'REPORT_UPLOADED',
  title: 'New Medical Report',
  message: `A new ${reportType} report has been uploaded`,
  reportId: report._id
});
```

---

## Security & Validation

### Backend
- ✅ Authentication required on all endpoints
- ✅ Role-based access control (admin only for upload/delete)
- ✅ Patients can only view their own reports
- ✅ PatientID verified before uploading
- ✅ Input validation on all fields
- ✅ File type validation

### Frontend
- ✅ Confirmation screen prevents wrong patient selection
- ✅ Form validation before submission
- ✅ Error handling and user feedback
- ✅ Loading states during operations

---

## Testing Checklist

### Backend API
- [ ] Search patients with different criteria
- [ ] Get patient details
- [ ] Upload report with all required fields
- [ ] Get reports for specific patient
- [ ] Get single report details
- [ ] Update report (admin only)
- [ ] Delete report (admin only)
- [ ] Verify permissions (patient can't delete, can only see own reports)
- [ ] Handle missing fields
- [ ] Test with invalid patient ID

### Mobile App
- [ ] Search functionality works
- [ ] Patient details display correctly
- [ ] Confirmation screen shows proper verification
- [ ] Form validation works
- [ ] File upload integrates properly
- [ ] Reports list displays correctly
- [ ] Unviewed badge appears/disappears
- [ ] Report detail screen shows all information
- [ ] Preview/Download/Share buttons functional
- [ ] Refresh pulls new data
- [ ] Error messages display appropriately

---

## Future Enhancements

1. **Real File Upload**: Implement actual file storage (AWS S3, Firebase Storage)
2. **Notification System**: Push notifications when reports uploaded
3. **Report Sharing**: Share reports with specific doctors
4. **Report History**: Track all report versions and updates
5. **Analytics**: Admin dashboard showing report statistics
6. **Bulk Upload**: Upload multiple reports at once
7. **Report Templates**: Pre-filled forms for common report types
8. **Integration with EHR**: Connect with external health records
9. **Digital Signatures**: Sign reports digitally
10. **Encryption**: Encrypt sensitive report data

---

## Support & Troubleshooting

### Common Issues

**Patient not found during search**
- Verify user is registered as patient role
- Check spelling of search terms
- Try different search criteria (ID vs name)

**Report upload fails**
- Check all required fields are filled
- Verify patient exists and is valid
- Check file size and format
- Ensure admin is logged in

**Patient can't see reports**
- Verify report was uploaded with correct patientID
- Check patient is viewing their own reports
- Refresh the reports list

**File upload not working**
- Implement file picker based on platform
- Check file size limits
- Verify file format compatibility

---

## API Response Examples

### Search Patients Response
```json
{
  "status": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "patientID": "PAT-ABC123DE",
      "phone": "555-1234",
      "email": "john@example.com",
      "dateOfBirth": "1990-01-15",
      "nic": "12345678901",
      "profileImage": "https://..."
    }
  ]
}
```

### Upload Report Response
```json
{
  "status": 201,
  "_id": "607f1f77bcf86cd799439012",
  "patient": "507f1f77bcf86cd799439011",
  "patientID": "PAT-ABC123DE",
  "reportType": "X-ray",
  "scanDate": "2024-05-01T10:00:00Z",
  "doctorName": "Dr. Smith",
  "description": "Chest X-ray examination",
  "reportFile": "/uploads/reports/chest-xray.pdf",
  "fileType": "pdf",
  "uploadedBy": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "Admin User",
    "email": "admin@hospital.com"
  },
  "isViewed": false,
  "createdAt": "2024-05-02T08:30:00Z"
}
```

---

## Documentation Links

- Backend API Documentation: `/api/medical-reports`
- Mobile Navigation: `src/navigation/`
- Theme Configuration: `src/theme.js`
- Authentication Context: `src/context/AuthContext.js`

---

**Last Updated**: May 3, 2026
**Version**: 1.0
**Status**: Ready for Integration
