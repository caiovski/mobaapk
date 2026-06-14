import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  sectionHeader: {
    fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase',
    paddingVertical: 8, paddingHorizontal: 8, marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 8,
  },
  totalSeparator: {
    height: 1, marginVertical: 8, marginHorizontal: 8,
  },
  globalTotal: {
    fontSize: 16, fontWeight: 'bold', textAlign: 'center',
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 40,
  },
  actionBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF', fontWeight: 'bold', fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  dateBtn: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  dateBtnText: { fontSize: 13, fontWeight: 'bold' },
  cancelBtn: {
    paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 40,
    alignSelf: 'stretch',
  },
});
