import React, { useState } from 'react';
import {
  View, Text, Dimensions, StatusBar, TouchableOpacity, ScrollView, TextInput, Image, Modal, Animated, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AdminHeader from '../../../components/AdminHeader';
import { AdminUserMenu } from '../../../components/AdminUserMenu';
import NoPhotoSvg from '../../../assets/tela8/No photo.svg';
import TrocarFotoSvg from '../../../assets/tela9/formulario/Trocar foto.svg';
import ConfirmarSvg from '../../../assets/tela9/formulario/confirmar/Confirmar.svg';
import FundoConfirmarSvg from '../../../assets/tela9/formulario/confirmar/Fundo.svg';
import EditIconNome from '../../../assets/tela9/formulario/nome produto/Edit.svg';
import EditIconDesc from '../../../assets/tela9/formulario/descricao/Edit.svg';
import EditIconPreco from '../../../assets/tela9/formulario/preco/Edit.svg';
import EditIconQtd from '../../../assets/tela9/formulario/quantidade/Edit.svg';
import { useProductEditScreen } from './useProductEditScreen';
import { useCategories } from '../../../contexts/useCategories';
import { styles } from './styles';

export default function ProductEditScreen() {
  const h = useProductEditScreen();
  const { categories } = useCategories();
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const renderTag = (cat: { id: string; name: string }) => {
    const isSelected = h.activeCategory === cat.name;
    return (
      <TouchableOpacity
          key={cat.id}
          onPress={() => { h.setActiveCategory(cat.name); h.navigation.navigate('Gerenciar', { categories: [cat.name] }); }}
        activeOpacity={0.7}
        style={[styles.tagItem, { backgroundColor: isSelected ? '#5B86E5' : 'transparent' }]}
      >
        <Text style={[styles.tagText, { color: isSelected ? '#FFFFFF' : h.labelColor, fontWeight: isSelected ? 'bold' : 'normal' }]}>{cat.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderNoPhoto = () => (
    <View style={{ alignItems: 'center' }}>
      <NoPhotoSvg width={310} height={220} />
      <TouchableOpacity style={styles.enviarFotoBtn} onPress={h.handleSelectPhoto}>
        {h.isDarkMode ? (
          <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', minWidth: 140 }}>Trocar foto</Text>
        ) : (
          <TrocarFotoSvg width={140} height={24} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPhotoCarousel = () => (
    <View style={{ alignItems: 'center', width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 220 }}>
        <View style={{ width: 45, height: 160, justifyContent: 'center', alignItems: 'center' }}>
          {h.currentPhotoIndex > 0 ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => h.setCurrentPhotoIndex(h.currentPhotoIndex - 1)}>
              <Image source={{ uri: h.photos[h.currentPhotoIndex - 1].uri }} style={{ width: 35, height: 140, borderRadius: 8, opacity: 0.3, resizeMode: 'cover' }} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={{ width: 220, height: 220, borderRadius: 15, overflow: 'hidden', marginHorizontal: 8, backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF' }}>
          <Image source={{ uri: h.photos[h.currentPhotoIndex].uri }} style={[styles.productPhoto, { width: '100%', height: '100%' }]} />
        </View>
        <View style={{ width: 45, height: 160, justifyContent: 'center', alignItems: 'center' }}>
          {h.currentPhotoIndex < h.photos.length - 1 ? (
            <TouchableOpacity activeOpacity={0.7} onPress={() => h.setCurrentPhotoIndex(h.currentPhotoIndex + 1)}>
              <Image source={{ uri: h.photos[h.currentPhotoIndex + 1].uri }} style={{ width: 35, height: 140, borderRadius: 8, opacity: 0.3, resizeMode: 'cover' }} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {h.photos.length > 1 && (
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 15, width: 120, height: 30, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginTop: 15 }}>
          <TouchableOpacity onPress={() => h.setCurrentPhotoIndex(Math.max(0, h.currentPhotoIndex - 1))} disabled={h.currentPhotoIndex === 0} style={{ opacity: h.currentPhotoIndex === 0 ? 0.3 : 1 }}>
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <TouchableOpacity onPress={() => h.setCurrentPhotoIndex(Math.min(h.photos.length - 1, h.currentPhotoIndex + 1))} disabled={h.currentPhotoIndex === h.photos.length - 1} style={{ opacity: h.currentPhotoIndex === h.photos.length - 1 ? 0.3 : 1 }}>
            <Feather name="chevron-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, width: '90%', justifyContent: 'center' }}>
        {h.photos.length < 5 && (
          <TouchableOpacity style={{ flex: 1, backgroundColor: '#339914', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }} onPress={h.handleSelectPhoto}>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Adicionar foto</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={{ flex: 1, backgroundColor: '#FF3B30', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }} onPress={h.removePhoto}>
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Remover atual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInput = (testID: string, value: string, onChange: (v: string) => void, refObj: any, isEditing: boolean, setIsEditing: (v: boolean) => void, EditIcon: any, opts?: { area?: boolean; numeric?: boolean; prefix?: boolean }) => {
    const editOnPress = () => { setIsEditing(true); setTimeout(() => refObj.current?.focus(), 100); };
    return (
      <View style={styles.inputContainer}>
        <TextInput
          ref={refObj}
          testID={testID}
          style={[
            styles.inputField,
            opts?.area ? styles.textArea : undefined,
            { backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF', color: h.colors.textDark },
            isEditing && styles.inputFieldEditing,
            /* istanbul ignore next */ opts?.prefix && value.length > 0 ? { paddingLeft: 42 } : undefined,
          ]}
          value={value}
          onChangeText={onChange}
          multiline={opts?.area}
          maxLength={opts?.area ? 500 : undefined}
          textAlignVertical={opts?.area ? 'top' : undefined}
          keyboardType={opts?.numeric ? 'numeric' : undefined}
          editable={isEditing}
          placeholder={/* istanbul ignore next */ isEditing ? (opts?.prefix ? '0,00' : opts?.area ? 'Digite a descrição...' : 'Digite o nome...') : ''}
          placeholderTextColor="#919191"
        />
        <TouchableOpacity style={/* istanbul ignore next */ opts?.area ? styles.editIconBottomRight : styles.editIconRight} onPress={editOnPress} testID={/* istanbul ignore next */ testID === 'product-price-input' ? 'edit-price-btn' : undefined}>
          <EditIcon width={16} height={16} color={h.isDarkMode ? '#FFE082' : '#042A7D'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: h.isDarkMode ? '#18181C' : '#F5F5F5' }]}>
      <StatusBar backgroundColor={h.colors.headerBackground} barStyle={h.isDarkMode ? 'light-content' : 'dark-content'} />
      <AdminHeader title="editar_produto" searchValue={h.searchText} onSearchChange={(text) => { h.setSearchText(text); h.navigation.navigate('Gerenciar', { searchText: text }); }} />
      <View style={[styles.filterContainer, { backgroundColor: h.isDarkMode ? '#18181C' : '#F5F5F5' }]}>
        <View style={[styles.filterPill, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#E3E4EB' }]}>
          <View style={styles.filterBtn}>
            <Feather name="sliders" size={12} color={h.labelColor} />
            <Text style={[styles.filterBtnText, { color: h.labelColor }]}>Filtro</Text>
          </View>
          <View style={[styles.filterSep, { backgroundColor: h.sepColor }]} />
          <Text style={[styles.categoryLabelText, { color: h.labelColor }]}>Categoria</Text>
          <View style={[styles.filterSep, { backgroundColor: h.sepColor }]} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {categories.map(renderTag)}
          </ScrollView>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#E3E4EB' }]}>
          <View style={styles.photoSection}>
            {h.photos.length === 0 ? renderNoPhoto() : renderPhotoCarousel()}
          </View>
          <View style={styles.fieldsContainer}>
            {renderInput('product-name-input', h.name, h.setName, h.nameRef, h.isEditingName, h.setIsEditingName, EditIconNome)}
            {renderInput('product-description-input', h.description, h.setDescription, h.descRef, h.isEditingDesc, h.setIsEditingDesc, EditIconDesc, { area: true })}
            <View style={styles.row}>
              <View style={styles.smallInputWrapper}>
                <View style={styles.inputContainer}>
                  {h.price.length > 0 && <Text style={[styles.currencyPrefix, { color: h.colors.textDark }]}>R$</Text>}
                  <TextInput
                    ref={h.priceRef}
                    testID="product-price-input"
                    style={[styles.inputField, { backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF', color: h.colors.textDark }, h.price.length > 0 && { paddingLeft: 42 }, h.isEditingPrice && styles.inputFieldEditing]}
                    value={h.price}
                    onChangeText={h.setPrice}
                    keyboardType="numeric"
                    editable={h.isEditingPrice}
                    placeholder={h.isEditingPrice && h.price.length === 0 ? '0,00' : ''}
                    placeholderTextColor="#919191"
                  />
                  <TouchableOpacity style={styles.editIconRight} testID="edit-price-btn" onPress={() => { h.setIsEditingPrice(true); setTimeout(() => h.priceRef.current?.focus(), 100); }}>
                    <EditIconPreco width={16} height={16} color={h.isDarkMode ? '#FFE082' : '#042A7D'} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.smallInputWrapper} />
            </View>
            <View style={styles.row}>
              <View style={styles.smallInputWrapper}>
                <View style={{ position: 'relative' }}>
                  {renderInput('product-quantity-input', h.quantity, h.setQuantity, h.qtyRef, h.isEditingQty, h.setIsEditingQty, EditIconQtd, { numeric: true })}
                  {// istanbul ignore next
                  h.isBulk && (
                    <>
                      {h.quantity.length > 0 && (
                        <View style={{ position: 'absolute', right: 54, top: 0, bottom: 0, justifyContent: 'center' }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: h.colors.textDark }}>{h.selectedUnit === 'kg' ? 'Kg' : 'g'}</Text>
                        </View>
                      )}
                      <View style={{ position: 'absolute', right: 32, top: 0, bottom: 0, justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => setShowUnitPicker(!showUnitPicker)} style={{ padding: 2 }} activeOpacity={0.7}>
                          <Feather name="chevron-down" size={16} color={h.colors.textDark} />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                  {// istanbul ignore next
                  h.isPerMeter && (
                    <View style={{ position: 'absolute', right: 32, top: 0, bottom: 0, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: h.colors.textDark }}>m</Text>
                    </View>
                  )}
                </View>
                {// istanbul ignore next
                h.isBulk && showUnitPicker && (
                  <View style={{ marginTop: 2, borderWidth: 1, borderColor: h.isDarkMode ? '#3E3E4A' : '#E3E4EB', borderRadius: 6, backgroundColor: h.isDarkMode ? '#2E2E38' : '#FFF' }}>
                    <TouchableOpacity onPress={() => { h.setSelectedUnit('kg'); setShowUnitPicker(false); }} style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                      <Text style={{ fontSize: 13, color: h.selectedUnit === 'kg' ? '#339914' : h.colors.textDark, fontWeight: h.selectedUnit === 'kg' ? 'bold' : 'normal' }}>Kilograma (Kg)</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: h.isDarkMode ? '#3E3E4A' : '#E3E4EB' }} />
                    <TouchableOpacity onPress={() => { h.setSelectedUnit('g'); setShowUnitPicker(false); }} style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                      <Text style={{ fontSize: 13, color: h.selectedUnit === 'g' ? '#339914' : h.colors.textDark, fontWeight: h.selectedUnit === 'g' ? 'bold' : 'normal' }}>Grama (g)</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.smallInputWrapper}>
                <TouchableOpacity style={styles.confirmBtn} onPress={h.handleConfirm} testID="save-product-btn">
                  <FundoConfirmarSvg width="100%" height={50} style={{ position: 'absolute', borderRadius: 10 }} />
                  <ConfirmarSvg width="70%" height={20} style={{ zIndex: 1 }} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.bulkToggleRow} onPress={() => h.setProductType(h.productType === 'bulk' ? 'unit' : 'bulk')} activeOpacity={0.7}>
              <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: h.productType === 'bulk' ? '#339914' : '#A8A8B3', alignItems: 'center', justifyContent: 'center' }}>
                {h.productType === 'bulk' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#339914' }} />}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: h.colors.textDark }}>Produto à granel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkToggleRow} onPress={() => h.setProductType(h.productType === 'per_meter' ? 'unit' : 'per_meter')} activeOpacity={0.7}>
              <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: h.productType === 'per_meter' ? '#339914' : '#A8A8B3', alignItems: 'center', justifyContent: 'center' }}>
                {h.productType === 'per_meter' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#339914' }} />}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: h.colors.textDark }}>Produto por metro</Text>
            </TouchableOpacity>
            <View style={styles.row}>
              <View style={styles.smallInputWrapper}>
                <Animated.View style={[styles.stockFieldContainer, { borderColor: '#FF3B30', backgroundColor: h.isDarkMode ? '#2C1D1E' : '#FFF0F0', opacity: h.criticalBlink }]}>
                  <Feather name="alert-circle" size={16} color="#FF3B30" style={{ marginRight: 6 }} />
                  <TextInput
                    testID="product-critical-stock-input"
                    style={[styles.stockFieldInput, { color: '#FF3B30' }]}
                    value={h.criticalStock}
                    onChangeText={h.setCriticalStock}
                    keyboardType="numeric"
                    placeholder="Estoque crítico"
                    placeholderTextColor="#FF3B30"
                  />
                </Animated.View>
              </View>
              <View style={styles.smallInputWrapper}>
                <Animated.View style={[styles.stockFieldContainer, { borderColor: '#FFB300', backgroundColor: h.isDarkMode ? '#2C2B1D' : '#FFFDE6', opacity: h.moderateBlink }]}>
                  <Feather name="alert-triangle" size={16} color="#FFB300" style={{ marginRight: 6 }} />
                  <TextInput
                    testID="product-moderate-stock-input"
                    style={[styles.stockFieldInput, { color: '#FFB300' }]}
                    value={h.moderateStock}
                    onChangeText={h.setModerateStock}
                    keyboardType="numeric"
                    placeholder="Estoque moderado"
                    placeholderTextColor="#FFB300"
                  />
                </Animated.View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Feather name="alert-circle" size={14} color="#00BFA5" />
              <Text style={{ fontSize: 11, color: '#00BFA5', flexShrink: 1 }}>
                Defina os valores mínimos para receber alertas visuais de estoque crítico (vermelho) e moderado (amarelo) na listagem de produtos.
              </Text>
            </View>
            <Animated.View style={[styles.bulkToggleRow, { opacity: Animated.add(0.75, Animated.multiply(h.promoGlow, 0.25)) }]}>
              <TouchableOpacity
                onPress={() => {
                  const next = !h.isPromo;
                  h.setIsPromo(next);
                  if (next) {
                    h.setDiscountPercentage('10');
                  } else {
                    h.setDiscountPercentage('');
                    h.setPromoStartAt('');
                    h.setPromoEndAt('');
                  }
                }}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: h.isPromo ? '#9C27B0' : '#A8A8B3', alignItems: 'center', justifyContent: 'center' }}>
                  {h.isPromo && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#9C27B0' }} />}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: h.colors.textDark }}>Em promoção</Text>
              </TouchableOpacity>
            </Animated.View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 2, marginBottom: 4 }}>
              <Feather name="alert-triangle" size={14} color="#9C27B0" style={{ marginTop: 2 }} />
              <Text style={{ fontSize: 11, color: '#9C27B0', flexShrink: 1 }}>
                ATENÇÃO administrador! Ao clicar neste botão, você precisará colocar o valor do desconto e a data/horário de início e fim desta promoção. Quando clicar em confirmar, este produto aparecerá como promoção para o cliente!
              </Text>
            </View>
            {// istanbul ignore next
            h.isPromo && (
              <>
                <Animated.View style={[styles.stockFieldContainer, { borderColor: '#9C27B0', backgroundColor: h.isDarkMode ? '#2C1D3D' : '#F5E6FF', opacity: Animated.add(0.8, Animated.multiply(h.promoGlow, 0.2)) }]}>
                  <Feather name="star" size={16} color="#9C27B0" style={{ marginRight: 6 }} />
                  <TextInput
                    testID="product-discount-input"
                    style={[styles.stockFieldInput, { color: '#9C27B0' }]}
                    value={h.discountPercentage}
                    onChangeText={h.setDiscountPercentage}
                    keyboardType="numeric"
                    placeholder="Porcentagem do desconto"
                    placeholderTextColor="#9C27B0"
                  />
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9C27B0', marginLeft: 4 }}>%</Text>
                </Animated.View>
                <Animated.View style={[styles.stockFieldContainer, { borderColor: h.isDarkMode ? '#4A4A54' : '#9C27B0', backgroundColor: h.isDarkMode ? '#2C2C36' : '#F5E6FF', opacity: Animated.add(0.8, Animated.multiply(h.promoGlow, 0.2)) }]}>
                  <Feather name="calendar" size={16} color={h.isDarkMode ? '#FF9800' : '#9C27B0'} style={{ marginRight: 6 }} />
                  <TouchableOpacity
                    onPress={() => h.setShowPromoDateModal(true)}
                    style={{ flex: 1, paddingVertical: 8 }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: h.promoStartAt ? (h.isDarkMode ? '#FF9800' : '#9C27B0') : (h.isDarkMode ? 'rgba(255,152,0,0.5)' : 'rgba(156,39,176,0.5)') }}>
                      {h.formatDateTime(h.promoStartAt)} → {h.formatDateTime(h.promoEndAt)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
      {/*
        istanbul ignore next
        Modal com DateTimePicker — nativo, difícil de testar em Jest.
      */
      h.showPromoDateModal ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => h.setShowPromoDateModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => h.setShowPromoDateModal(false)}>
            <View style={[styles.modalContainer, { backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF' }]}>
              <Text style={[styles.modalTitle, { color: h.colors.textDark }]}>Período da Promoção</Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: h.isDarkMode ? '#FF9800' : '#9C27B0', marginBottom: 8 }}>Horário</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => h.setShowTimePicker('start')}
                    style={{ flex: 1, backgroundColor: h.isDarkMode ? '#2C2C36' : '#F5E6FF', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: h.isDarkMode ? '#4A4A54' : '#9C27B0' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: h.isDarkMode ? '#FFFFFF' : '#9C27B0', marginBottom: 2 }}>Início</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: h.isDarkMode ? '#FF9800' : '#9C27B0' }}>
                      {`${String(h.promoStartTime.getHours()).padStart(2, '0')}:${String(h.promoStartTime.getMinutes()).padStart(2, '0')}`}
                    </Text>
                  </TouchableOpacity>
                  <Feather name="arrow-right" size={16} color={h.isDarkMode ? '#FF9800' : '#9C27B0'} />
                  <TouchableOpacity
                    onPress={() => h.setShowTimePicker('end')}
                    style={{ flex: 1, backgroundColor: h.isDarkMode ? '#2C2C36' : '#F5E6FF', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: h.isDarkMode ? '#4A4A54' : '#9C27B0' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: h.isDarkMode ? '#FFFFFF' : '#9C27B0', marginBottom: 2 }}>Fim</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: h.isDarkMode ? '#FF9800' : '#9C27B0' }}>
                      {`${String(h.promoEndTime.getHours()).padStart(2, '0')}:${String(h.promoEndTime.getMinutes()).padStart(2, '0')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: h.isDarkMode ? '#FF9800' : '#9C27B0', marginBottom: 8 }}>Data</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => h.setShowDatePicker('start')}
                    style={{ flex: 1, backgroundColor: h.isDarkMode ? '#2C2C36' : '#F5E6FF', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: h.isDarkMode ? '#4A4A54' : '#9C27B0' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: h.isDarkMode ? '#FFFFFF' : '#9C27B0', marginBottom: 2 }}>Início</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: h.isDarkMode ? '#FF9800' : '#9C27B0' }}>
                      {`${String(h.promoStartDate.getDate()).padStart(2, '0')}/${String(h.promoStartDate.getMonth() + 1).padStart(2, '0')}/${h.promoStartDate.getFullYear()}`}
                    </Text>
                  </TouchableOpacity>
                  <Feather name="arrow-right" size={16} color={h.isDarkMode ? '#FF9800' : '#9C27B0'} />
                  <TouchableOpacity
                    onPress={() => h.setShowDatePicker('end')}
                    style={{ flex: 1, backgroundColor: h.isDarkMode ? '#2C2C36' : '#F5E6FF', borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: h.isDarkMode ? '#4A4A54' : '#9C27B0' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: h.isDarkMode ? '#FFFFFF' : '#9C27B0', marginBottom: 2 }}>Fim</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: h.isDarkMode ? '#FF9800' : '#9C27B0' }}>
                      {`${String(h.promoEndDate.getDate()).padStart(2, '0')}/${String(h.promoEndDate.getMonth() + 1).padStart(2, '0')}/${h.promoEndDate.getFullYear()}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: h.isDarkMode ? '#333' : '#E3E4EB', marginVertical: 8 }} />

              <TouchableOpacity
                onPress={h.confirmPromoDateTime}
                style={{ backgroundColor: '#25BE36', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 }}
                activeOpacity={0.7}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => h.setShowPromoDateModal(false)}
                style={{ borderRadius: 10, borderWidth: 1.5, borderColor: '#FF3B30', paddingVertical: 14, alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      ) : null}

      {/*
        istanbul ignore next
        DateTimePicker nativo — não renderiza corretamente em Jest.
      */
      (h.showTimePicker === 'start' || h.showTimePicker === 'end') ? (
        <DateTimePicker
          value={h.showTimePicker === 'start' ? h.promoStartTime : h.promoEndTime}
          mode="time"
          is24Hour
          display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={(_: any, selectedDate?: Date) => {
            if (selectedDate) {
              if (h.showTimePicker === 'start') h.setPromoStartTime(selectedDate);
              else h.setPromoEndTime(selectedDate);
            }
            h.setShowTimePicker(null);
          }}
        />
      ) : null}
      {/*
        istanbul ignore next
        DateTimePicker nativo — não renderiza corretamente em Jest.
      */
      (h.showDatePicker === 'start' || h.showDatePicker === 'end') ? (
        <DateTimePicker
          value={h.showDatePicker === 'start' ? h.promoStartDate : h.promoEndDate}
          mode="date"
          display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={(_: any, selectedDate?: Date) => {
            if (selectedDate) {
              if (h.showDatePicker === 'start') h.setPromoStartDate(selectedDate);
              else h.setPromoEndDate(selectedDate);
            }
            h.setShowDatePicker(null);
          }}
        />
      ) : null}

      <Modal visible={h.showImagePickerOptions} transparent animationType="fade" onRequestClose={() => h.setShowImagePickerOptions(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => h.setShowImagePickerOptions(false)}>
          <View style={[styles.modalContainer, { backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: h.colors.textDark }]}>Trocar Foto do Produto</Text>
            <TouchableOpacity style={styles.modalOption} onPress={h.openCamera}>
              <Text style={[styles.modalOptionText, { color: h.colors.textDark }]}>Tirar Foto</Text>
            </TouchableOpacity>
            <View style={[styles.modalSeparator, { backgroundColor: h.isDarkMode ? '#333333' : '#E3E4EB' }]} />
            <TouchableOpacity style={styles.modalOption} onPress={h.openGallery}>
              <Text style={[styles.modalOptionText, { color: h.colors.textDark }]}>Escolher da Galeria</Text>
            </TouchableOpacity>
            <View style={[styles.modalSeparator, { backgroundColor: h.isDarkMode ? '#333333' : '#E3E4EB' }]} />
            <TouchableOpacity style={[styles.modalOption, { marginTop: 10 }]} onPress={() => h.setShowImagePickerOptions(false)}>
              <Text style={[styles.modalOptionText, styles.modalCancelText]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <AdminUserMenu />
    </View>
  );
}
