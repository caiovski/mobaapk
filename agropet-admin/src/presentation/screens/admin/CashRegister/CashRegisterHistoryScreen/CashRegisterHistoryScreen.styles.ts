import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  codeText: { fontSize: 14, fontWeight: 'bold' },
  dateText: { fontSize: 12, marginTop: 2 },
  viewBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
  },
  viewBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  emptyText: { textAlign: 'center', fontSize: 14, marginTop: 60 },
});
