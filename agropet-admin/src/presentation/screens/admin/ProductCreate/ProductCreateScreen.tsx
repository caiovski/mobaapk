import React, { useState } from 'react';
import {
  View, Text, Dimensions, StatusBar, TouchableOpacity, ScrollView, TextInput, Image, Modal, StyleSheet, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AdminHeader from '../../../components/AdminHeader';
import { AdminUserMenu } from '../../../components/AdminUserMenu';
import NoPhotoSvg from '../../../assets/tela8/No photo.svg';
import EnviarFotoSvg from '../../../assets/tela8/Enviar foto.svg';
import FundoRegistrarSvg from '../../../assets/tela8/formulario/registrar/Fundo.svg';
import RegistrarSvg from '../../../assets/tela8/formulario/registrar/Registrar.svg';
import DigiteNomeSvg from '../../../assets/tela8/formulario/nome produto/Digite o nome do produto....svg';
import DigiteDescricaoSvg from '../../../assets/tela8/formulario/descricao/Digite a descrição do produto....svg';
import PrecoSvg from '../../../assets/tela8/formulario/preco/Preço_ ....svg';
import QuantidadeSvg from '../../../assets/tela8/formulario/quantidade/Quantidade_ ....svg';
import { useProductCreateScreen } from './useProductCreateScreen';
import { useCategories } from '../../../contexts/useCategories';
import { styles } from './styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProductCreateScreen() {
  const h = useProductCreateScreen();
  const { categories } = useCategories();
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const renderTag = (cat: { id: string; name: string }) => {
    return (
      <TouchableOpacity
        key={cat.id}
        onPress={() => h.navigation.navigate('Gerenciar', { categories: [cat.name] })}
        activeOpacity={0.7}
        style={[styles.tagItem, { backgroundColor: 'transparent' }]}
      >
        <Text style={[styles.tagText, { color: h.labelColor }]}>{cat.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderNoPhoto = () => (
    <View style={{ alignItems: 'center' }}>
      <NoPhotoSvg width={310} height={220} />
      <TouchableOpacity testID="enviar-foto-btn" style={styles.enviarFotoBtn} onPress={h.handleSelectPhoto}>
        {h.isDarkMode ? (
          <Text style={{ fontSize: 19, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', minWidth: 140 }}>Enviar foto</Text>
        ) : (
          <EnviarFotoSvg width={140} height={24} />
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

  const renderInput = (testID: string, value: string, onChange: (v: string) => void, svg: any, opts?: { area?: boolean; numeric?: boolean; prefix?: boolean; placeholderWidth?: number; }) => (
    <View style={styles.inputContainer}>
      {/* istanbul ignore next */ value.length === 0 && React.cloneElement(svg, { width: opts?.placeholderWidth ?? (opts?.prefix ? 70 : (opts?.area ? 230 : 200)), height: 14, style: [styles.placeholderSvg, opts?.area ? { top: 15 } : undefined] })}
      {opts?.prefix && value.length > 0 && <Text style={[styles.currencyPrefix, { color: h.isDarkMode ? '#919191' : h.colors.textDark }]}>R$</Text>}
      <TextInput
        testID={testID}
        style={[styles.inputField, opts?.area ? styles.textArea : undefined, { backgroundColor: h.isDarkMode ? '#1E1E24' : '#E3E4EB', color: h.isDarkMode ? '#919191' : h.colors.textDark }, opts?.prefix && value.length > 0 ? { paddingLeft: 42 } : undefined]}
        value={value}
        onChangeText={onChange}
        multiline={opts?.area}
        maxLength={opts?.area ? 500 : undefined}
        textAlignVertical={opts?.area ? 'top' : undefined}
        keyboardType={opts?.numeric ? 'numeric' : undefined}
      />
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: h.isDarkMode ? '#18181C' : '#F5F5F5' }]}>
      <StatusBar backgroundColor={h.colors.headerBackground} barStyle={h.isDarkMode ? 'light-content' : 'dark-content'} />
      <AdminHeader title="registrar_produto" searchValue={h.searchText} onSearchChange={(text) => { h.setSearchText(text); h.navigation.navigate('Gerenciar', { searchText: text }); }} />
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
        <View style={[styles.formCard, { backgroundColor: h.isDarkMode ? '#2E2E38' : '#FFFFFF' }]}>
          <View style={styles.photoSection}>
            {h.photos.length === 0 ? renderNoPhoto() : renderPhotoCarousel()}
          </View>
          <View style={styles.fieldsContainer}>
            {renderInput('product-name-input', h.name, h.setName, <DigiteNomeSvg />)}
            {renderInput('product-description-input', h.description, h.setDescription, <DigiteDescricaoSvg />, { area: true, placeholderWidth: 200 })}
            <View style={styles.row}>
              <View style={styles.smallInputWrapper}>
                {renderInput('product-price-input', h.price, h.setPrice, <PrecoSvg />, { prefix: true, numeric: true })}
              </View>
              <View style={styles.smallInputWrapper}>
                <View style={{ position: 'relative' }}>
                  {renderInput('product-quantity-input', h.quantity, h.setQuantity, <QuantidadeSvg />, { numeric: true, placeholderWidth: h.isBulk ? 90 : h.isPerMeter ? 90 : 115 })}
                  {// istanbul ignore next
                  h.isBulk && (
                    <View style={{ position: 'absolute', right: 8, top: 0, bottom: 0, justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => setShowUnitPicker(!showUnitPicker)} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} activeOpacity={0.7}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: h.colors.textDark }}>{h.selectedUnit === 'kg' ? 'Kg' : 'g'}</Text>
                        <Feather name="chevron-down" size={14} color={h.colors.textDark} />
                      </TouchableOpacity>
                    </View>
                  )}
                  {// istanbul ignore next
                  h.isPerMeter && (
                    <View style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: h.colors.textDark }}>m</Text>
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
              </View>
            </View>
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
            <View style={styles.row}>
              <View style={styles.smallInputWrapper} />
              <View style={styles.smallInputWrapper}>
                <TouchableOpacity testID="register-product-btn" style={styles.registerBtn} onPress={h.handleRegister}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#339914', borderRadius: 10 }]} />
                  <RegistrarSvg width="100%" height={20} style={{ zIndex: 1 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal visible={h.showImagePickerOptions} transparent animationType="fade" onRequestClose={() => h.setShowImagePickerOptions(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => h.setShowImagePickerOptions(false)}>
          <View style={[styles.modalContainer, { backgroundColor: h.isDarkMode ? '#1E1E24' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: h.colors.textDark }]}>Adicionar Foto do Produto</Text>
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
