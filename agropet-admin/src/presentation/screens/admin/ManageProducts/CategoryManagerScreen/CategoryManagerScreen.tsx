import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AdminHeader from '../../../../components/AdminHeader';
import { useCategoryManagerScreen } from './useCategoryManagerScreen';
import { styles } from './styles';

export default function CategoryManagerScreen() {
  const h = useCategoryManagerScreen();

  const renderCard = (cat: any) => {
    const isEditing = h.editingId === cat.id;
    const isExpanded = h.expandedIds.has(cat.id);
    const hasManyKeywords = cat.keywords.length > 2;
    const showExpand = !isEditing && hasManyKeywords;

    return (
      <View key={cat.id} style={[styles.card, {
        backgroundColor: /* istanbul ignore next */ h.isDarkMode ? '#2E2E38' : '#E3E4EB',
        borderColor: /* istanbul ignore next */ cat.active ? (h.isDarkMode ? '#3E3E4A' : '#D0D0D0') : '#FF3B30',
        opacity: cat.active ? 1 : 0.6,
      }]}>
        { /* istanbul ignore next */ isEditing ? (
          <>
            <TextInput
              style={[styles.editInput, { borderColor: h.isDarkMode ? '#3E3E4A' : '#D0D0D0', color: h.isDarkMode ? '#FFF' : '#1C2434' }]}
              value={h.editName}
              onChangeText={h.setEditName}
              placeholder="Nome"
              placeholderTextColor={h.isDarkMode ? '#888' : '#A8A8B3'}
            />
            <TextInput
              style={[styles.editInput, { borderColor: h.isDarkMode ? '#3E3E4A' : '#D0D0D0', color: h.isDarkMode ? '#FFF' : '#1C2434' }]}
              value={h.editKeywords}
              onChangeText={h.setEditKeywords}
              placeholder="Keywords (separadas por vírgula)"
              placeholderTextColor={h.isDarkMode ? '#888' : '#A8A8B3'}
            />
            <View style={styles.editActionsRow}>
              <TouchableOpacity style={{ padding: 6 }} onPress={h.saveEditing} activeOpacity={0.7}>
                <Feather name="check" size={18} color="#25BE36" />
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 6 }} onPress={h.cancelEditing} activeOpacity={0.7}>
                <Feather name="x" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardRow}>
              <Text style={[styles.cardName, { color: h.isDarkMode ? '#FFF' : '#1C2434' }]}>{cat.name}</Text>
              <TouchableOpacity onPress={() => h.startEditing(cat)} activeOpacity={0.7}>
                <Feather name="edit-2" size={14} color={h.isDarkMode ? '#FFE082' : '#8A7268'} />
              </TouchableOpacity>
            </View>
            <Text style={/* istanbul ignore next */ [
              styles.cardKeywords,
              { color: h.isDarkMode ? '#A8A8B3' : '#767676' },
               showExpand && (!isExpanded ? styles.collapsedKeywords : styles.expandedKeywords),
            ]} numberOfLines={/* istanbul ignore next */ showExpand && !isExpanded ? 2 : undefined}>
              {cat.keywords.join(', ')}
            </Text>
            {showExpand && (
              <TouchableOpacity style={styles.expandBtn} onPress={() => h.toggleCollapse(cat.id)} activeOpacity={0.7}>
                <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={12} color={h.isDarkMode ? '#A8A8B3' : '#767676'} />
              </TouchableOpacity>
            )}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => h.toggleActive(cat.id, !cat.active)} activeOpacity={0.7}>
                <Feather name={cat.active ? 'eye' : 'eye-off'} size={16} color={cat.active ? '#25BE36' : '#888'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => h.handleDelete(cat.id, cat.name)} activeOpacity={0.7}>
                <Feather name="trash-2" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  /* istanbul ignore next */ return (
    <View style={/* istanbul ignore next */ { flex: 1, backgroundColor: h.isDarkMode ? '#18181C' : '#F5F5F5' }}>
      <AdminHeader title="gerenciar" />
      {/* istanbul ignore next */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={h.refreshing} onRefresh={h.onRefresh} tintColor="#FF5C00" colors={['#FF5C00']} />
        }
      >
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => h.setShowCreateModal(true)}>
          <Feather name="plus" size={18} color="#FFF" />
          <Text style={styles.addButtonText}>Nova Categoria</Text>
        </TouchableOpacity>

        { /* istanbul ignore next */ h.loading ? (
          <ActivityIndicator size="large" color="#FF5C00" style={{ marginTop: 20 }} />
        ) : /* istanbul ignore next */ h.allCategories.length === 0 ? (
          <Text style={[styles.emptyText, { color: /* istanbul ignore next */ h.isDarkMode ? '#8E8E93' : '#919191' }]}>Nenhuma categoria cadastrada.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {h.allCategories.map(renderCard)}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={h.showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={/* istanbul ignore next */ [styles.whiteModalContainer, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#FFF' }]}>
            <Text style={/* istanbul ignore next */ [styles.whiteModalTitle, { color: h.isDarkMode ? '#FFF' : '#1C2434' }]}>Nova Categoria</Text>
            <TextInput
              placeholder="Nome da categoria"
              placeholderTextColor={/* istanbul ignore next */ h.isDarkMode ? '#888' : '#A8A8B3'}
              value={h.newName}
              onChangeText={h.setNewName}
              style={{ borderBottomWidth: 1, borderColor: /* istanbul ignore next */ h.isDarkMode ? '#3E3E4A' : '#E3E4EB', color: /* istanbul ignore next */ h.isDarkMode ? '#FFF' : '#1C2434', paddingVertical: 8, marginBottom: 16, fontSize: 14 }}
            />
            <TextInput
              placeholder="Palavras-chave (separadas por vírgula)"
              placeholderTextColor={/* istanbul ignore next */ h.isDarkMode ? '#888' : '#A8A8B3'}
              value={h.newKeywords}
              onChangeText={h.setNewKeywords}
              style={{ borderBottomWidth: 1, borderColor: /* istanbul ignore next */ h.isDarkMode ? '#3E3E4A' : '#E3E4EB', color: /* istanbul ignore next */ h.isDarkMode ? '#FFF' : '#1C2434', paddingVertical: 8, marginBottom: 16, fontSize: 14 }}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#339914' }]} activeOpacity={0.7} onPress={h.handleCreate}>
                <Text style={styles.modalConfirmText}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: /* istanbul ignore next */ h.isDarkMode ? '#3E3E4A' : '#E3E4EB' }]} activeOpacity={0.7} onPress={() => h.setShowCreateModal(false)}>
                <Text style={[styles.modalCancelText, { color: /* istanbul ignore next */ h.isDarkMode ? '#FFF' : '#1C2434' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
