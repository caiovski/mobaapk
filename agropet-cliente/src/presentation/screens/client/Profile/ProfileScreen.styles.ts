import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 130,
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  photoPlaceholder: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  personIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alterarFotoText: {
    fontSize: 16,
    color: '#042A7D',
    fontWeight: 'bold',
  },
  topFields: {
    flex: 1,
    gap: 10,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1C2434',
  },
  textInputBox: {
    backgroundColor: '#E3E4EB',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  input: {
    fontSize: 14,
    color: '#1C2434',
    fontWeight: 'bold',
  },
  infoRow: {
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: '#E3E4EB',
    borderRadius: 10,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#1C2434',
    fontWeight: 'bold',
  },
  alterarLink: {
    fontSize: 14,
    color: '#042A7D',
    fontWeight: 'bold',
  },
  addressCard: {
    backgroundColor: '#1C2434',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addressTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  enviarBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enviarBtnActive: {
    backgroundColor: '#25BE36',
  },
  enviarBtnConfirmed: {
    backgroundColor: '#25BE36',
  },
  enviarBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addressInputBoxError: {
    borderColor: '#FF3B30',
    borderWidth: 1.0,
  },
  addressErrorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  addressFieldGroup: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  addressInputBox: {
    backgroundColor: '#E3E4EB',
    borderRadius: 8,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  addressInput: {
    flex: 1,
    fontSize: 13,
    color: '#1C2434',
  },
  alterarLinkAddr: {
    fontSize: 13,
    color: '#042A7D',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
  },
  obsText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
    lineHeight: 24,
  },
  obsTextBold: {
    fontWeight: 'bold',
  },
  tabBarOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 16,
    right: 16,
  },
  tabBarInner: {
    flexDirection: 'row',
    backgroundColor: '#E3E4EB',
    borderRadius: 30,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabSeparator: {
    width: 1,
    height: 49,
    backgroundColor: '#8A7268',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconBgInactive: {
    width: 51,
    height: 41,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  profilePhoto: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  suggestionsDropdown: {
    backgroundColor: '#2A3444',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 160,
    paddingVertical: 4,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4454',
  },
  suggestionText: {
    fontSize: 13,
    color: '#E0E0E0',
  },
});
