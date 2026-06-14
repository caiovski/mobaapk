import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  card: {
    width: '48%',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginBottom: 6,
  },
  cardKeywords: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  collapsedKeywords: {
    maxHeight: 32,
    overflow: 'hidden',
  },
  expandedKeywords: {
    maxHeight: 500,
  },
  expandBtn: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  editInput: {
    borderBottomWidth: 1,
    paddingVertical: 4,
    fontSize: 13,
    marginBottom: 6,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2BE060',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 24,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteModalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignSelf: 'center',
  },
  whiteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.2,
    alignItems: 'center',
  },
  modalCancelText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
