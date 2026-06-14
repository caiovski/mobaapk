import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  headerCard: {
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  headerDate: {
    fontSize: 16, fontWeight: 'bold', marginBottom: 4,
  },
  headerCode: {
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase',
    paddingVertical: 8, paddingHorizontal: 8, marginTop: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  labelCell: {
    width: 70, fontSize: 14, fontWeight: 'bold',
  },
  cell: {
    flex: 1, fontSize: 14, fontWeight: 'bold', textAlign: 'center',
  },
  dimCell: {
    flex: 1, fontSize: 13, textAlign: 'center',
  },
  colHeader: {
    flex: 1, fontSize: 12, fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase',
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 8,
  },
  totalSeparator: {
    height: 1, marginVertical: 8, marginHorizontal: 8,
  },
  totalValue: {
    fontSize: 16, fontWeight: 'bold', textAlign: 'center',
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF', fontWeight: 'bold', fontSize: 15,
  },
});
