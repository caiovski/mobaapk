import React, { useRef, useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, FlatList, ActivityIndicator, Animated, TextInput, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../../../theme/colors';
import AdminHeader from '../../../components/AdminHeader';
import { AdminUserMenu } from '../../../components/AdminUserMenu';
import CheckIcon from '../../../assets/tela7/registrar/Adicionar/Remover/Check.svg';
import DeleteProductIcon from '../../../assets/tela7/excluir/Adicionar/Remover/Delete product.svg';
import { useManageProductsScreen } from './useManageProductsScreen';
import { ProductCard } from './ProductCard';
import { FilterModal } from './FilterModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { styles } from './styles';

export default function ManageProductsScreen() {
  const h = useManageProductsScreen();
  const labelColor = h.isDarkMode ? '#FFFFFF' : '#8A7268';
  const sepColor = h.isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268';

  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const [showCreateCatModal, setShowCreateCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatKeywords, setNewCatKeywords] = useState('');

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const handleCreateCategory = async () => {
    const trimmedName = newCatName.trim();
    const keywords = newCatKeywords.split(',').map(k => k.trim()).filter(Boolean);
    if (!trimmedName) return;
    await h.createCategory(trimmedName, keywords);
    setNewCatName('');
    setNewCatKeywords('');
    setShowCreateCatModal(false);
  };

  const getFilterLabel = () => {
    const parts: string[] = [];
    if (h.statusFilter !== 'Todos') parts.push(h.statusFilter);
    if (h.alertYellowFilter) parts.push('Moderado');
    if (h.alertRedFilter) parts.push('Crítico');
    return parts.length === 0 ? 'Filtro' : parts.join(' + ');
  };

  /* istanbul ignore next */ const renderTag = (category: { id: string; name: string }) => {
    const isSelected = h.activeCategories.includes(category.name);
    return (
      <TouchableOpacity key={category.id} onPress={() => h.setActiveCategories(prev => prev.includes(category.name) ? prev.filter((c: string) => c !== category.name) : [...prev, category.name])} activeOpacity={0.7}
        style={[styles.tagItem, { backgroundColor: isSelected ? (h.isDarkMode ? '#5B86E5' : '#E3DAD9') : 'transparent' }]}>
        <Text style={[styles.tagText, { color: isSelected ? (h.isDarkMode ? '#FFFFFF' : '#9C3F07') : labelColor, fontWeight: isSelected ? 'bold' : 'normal' }]}>{category.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: any) => (
    <ProductCard
      item={item}
      selectionMode={h.selectionMode}
      isSelected={h.selectedProductIds.has(item.id)}
      onToggleSelect={h.toggleSelection}
      onEdit={(product: any) => h.navigation.navigate('ProductEditScreen', { product })}
      onDelete={h.deleteProduct}
      onToggleStatus={h.toggleProductStatus}
      onDismissAlert={h.dismissAlert}
    />
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: h.isDarkMode ? '#18181C' : '#F5F5F5' }]}>
      <StatusBar backgroundColor={h.colors.headerBackground} barStyle="light-content" />
      <AdminHeader title="gerenciar" searchValue={h.searchText} onSearchChange={h.setSearchText} />
      <View style={[styles.filterContainer, { backgroundColor: h.isDarkMode ? '#18181C' : '#F5F5F5' }]}>
        <View style={[styles.filterPill, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#E3E4EB' }]}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => h.setShowFilterModal(true)} activeOpacity={0.7}>
            <Feather name="sliders" size={12} color={labelColor} />
            <Text style={[styles.filterBtnText, { color: labelColor }]}>{getFilterLabel()}</Text>
            <Feather name="chevron-down" size={12} color={labelColor} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
          <View style={[styles.filterSep, { backgroundColor: sepColor }]} />
          <Text style={[styles.categoryLabelText, { color: labelColor }]}>Categoria</Text>
          <View style={[styles.filterSep, { backgroundColor: sepColor }]} />
          <FlatList horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow} data={h.categories} renderItem={({ item }) => renderTag(item)} keyExtractor={(item) => item.id} />
          <TouchableOpacity onPress={() => setShowCreateCatModal(true)} activeOpacity={0.7}>
            <Animated.View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#2BE060', alignItems: 'center', justifyContent: 'center', opacity: pulseAnim }}>
              <Feather name="plus" size={16} color="#FFF" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.actionButtonsRow}>
        <View style={styles.deleteColumnContainer}>
          <TouchableOpacity style={styles.registerBtn} onPress={() => h.navigation.navigate('ProductCreateScreen')}>
            <CheckIcon width={34} height={34} fill={h.isDarkMode ? '#FFFFFF' : undefined} />
            <Text style={styles.actionBtnText}>Registrar produto</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.deleteColumnContainer}>
          <TouchableOpacity style={[styles.massDeleteBtn, h.selectionMode && styles.massDeleteBtnActive]} onPress={h.handleMassDelete}>
            <DeleteProductIcon width={33} height={32} fill={h.isDarkMode ? '#FFFFFF' : undefined} style={{ marginRight: 8 }} />
            {h.selectionMode ? <Text style={styles.massDeleteBtnText}>Confirmar ({h.selectedProductIds.size})</Text> : <Text style={styles.actionBtnText}>Excluir produto</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.secondaryActionsRow}>
        <TouchableOpacity activeOpacity={0.7} onPress={h.handleSelectAllBtn} style={[styles.secondaryBtn, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#E3E4EB' }]}>
          <Text style={[styles.secondaryBtnText, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>
            {h.filteredProducts.length > 0 && h.filteredProducts.every((p: any) => h.selectedProductIds.has(p.id)) ? "Deselecionar tudo" : "Selecionar tudo"}
          </Text>
        </TouchableOpacity>
        { /* istanbul ignore next */ h.selectionMode ? (
          <TouchableOpacity activeOpacity={0.7} onPress={() => { h.setSelectionMode(false); h.setSelectedProductIds(new Set()); }} style={[styles.secondaryBtn, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#E3E4EB' }]}>
            <Text style={[styles.secondaryBtnText, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>Cancelar Seleção</Text>
          </TouchableOpacity>
        ) : h.allProductsInactive ? (
          <TouchableOpacity activeOpacity={0.7} onPress={h.handleReactivateAll} style={[styles.secondaryBtn, { backgroundColor: '#339914' }]}>
            <Text style={[styles.secondaryBtnText, { color: '#FFFFFF' }]}>Reativar todos</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={0.7} onPress={h.handleDeactivateAll} style={[styles.secondaryBtn, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.secondaryBtnText, { color: '#FF3B30' }]}>Desativar todos</Text>
          </TouchableOpacity>
        )}
      </View>
      {h.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
        </View>
      ) : (
        <FlatList data={h.filteredProducts} keyExtractor={(item) => item.id} renderItem={renderProduct} contentContainerStyle={styles.productsList} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: h.isDarkMode ? '#8E8E93' : '#919191', textAlign: 'center' }]}>{h.hasError ? "Não foi possível carregar os produtos." : "Este produto não foi encontrado/registrado ainda."}</Text></View>} />
      )}
      <View style={{ height: 100 }} />
      <DeleteConfirmModal visible={h.showConfirmDeleteModal} isDarkMode={h.isDarkMode} selectedCount={h.selectedProductIds.size} onConfirm={h.confirmMassDelete} onClose={() => h.setShowConfirmDeleteModal(false)} />
      <FilterModal visible={h.showFilterModal} isDarkMode={h.isDarkMode} colors={h.colors}
        tempStatusFilter={h.tempStatusFilter} tempAlertYellowFilter={h.tempAlertYellowFilter} tempAlertRedFilter={h.tempAlertRedFilter}
        onSelectStatus={(s: any) => { h.setTempStatusFilter(s); /* istanbul ignore next */ if (s === 'Inativos') { h.setTempAlertYellowFilter(false); h.setTempAlertRedFilter(false); } }}
        onToggleYellow={() => { /* istanbul ignore next */ if (h.tempStatusFilter !== 'Inativos') h.setTempAlertYellowFilter(!h.tempAlertYellowFilter); }}
        onToggleRed={() => { /* istanbul ignore next */ if (h.tempStatusFilter !== 'Inativos') h.setTempAlertRedFilter(!h.tempAlertRedFilter); }}
        tempSortOption={h.tempSortOption}
        onSelectSort={(opt) => h.setTempSortOption(opt)}
        onApply={() => { h.setStatusFilter(h.tempStatusFilter); h.setAlertYellowFilter(h.tempAlertYellowFilter); h.setAlertRedFilter(h.tempAlertRedFilter); h.setSortOption(h.tempSortOption); h.setShowFilterModal(false); }}
        onClose={() => h.setShowFilterModal(false)}
        allCategories={h.allCategories} categories={h.categories}
        onCreateCategory={h.createCategory} onToggleCategoryActive={h.toggleCategoryActive} onDeleteCategory={h.deleteCategory} />
      <AdminUserMenu />
      <Modal visible={showCreateCatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.whiteModalContainer, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#FFFFFF' }]}>
            <Text style={[styles.whiteModalTitle, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>Nova Categoria</Text>
            <TextInput
              placeholder="Nome da categoria"
              placeholderTextColor={h.isDarkMode ? '#888' : '#A8A8B3'}
              value={newCatName}
              onChangeText={setNewCatName}
              style={{ borderBottomWidth: 1, borderColor: h.isDarkMode ? '#3E3E4A' : '#E3E4EB', color: h.isDarkMode ? '#FFF' : '#1C2434', paddingVertical: 8, marginBottom: 16, fontSize: 14 }}
            />
            <TextInput
              placeholder="Palavras-chave (separadas por vírgula)"
              placeholderTextColor={h.isDarkMode ? '#888' : '#A8A8B3'}
              value={newCatKeywords}
              onChangeText={setNewCatKeywords}
              style={{ borderBottomWidth: 1, borderColor: h.isDarkMode ? '#3E3E4A' : '#E3E4EB', color: h.isDarkMode ? '#FFF' : '#1C2434', paddingVertical: 8, marginBottom: 16, fontSize: 14 }}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#339914' }]} activeOpacity={0.7} onPress={handleCreateCategory}>
                <Text style={styles.modalConfirmText}>Criar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: h.isDarkMode ? '#3E3E4A' : '#E3E4EB' }]} activeOpacity={0.7} onPress={() => { setShowCreateCatModal(false); setNewCatName(''); setNewCatKeywords(''); }}>
                <Text style={[styles.modalCancelText, { color: h.isDarkMode ? '#FFFFFF' : '#1C2434' }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
