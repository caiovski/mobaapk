import { useState, useEffect, useRef } from 'react';
import { Alert, TextInput, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useTheme } from '../../../contexts/ThemeContext';

function getAllImageUrls(url: string | null | undefined): string[] {
  if (!url) return [];
  const trimmed = url.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(u => !!u);
    } catch (_) {}
  }
  return [url];
}

export function useProductEditScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;

  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(product?.category_id || null);
  const [showImagePickerOptions, setShowImagePickerOptions] = useState(false);
  const [showConfirmEndPromoModal, setShowConfirmEndPromoModal] = useState(false);
  const [photos, setPhotos] = useState<Array<{ uri: string; base64?: string | null }>>(() => {
    return getAllImageUrls(product?.image_url).map(u => ({ uri: u, base64: null }));
  });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [quantity, setQuantity] = useState(product?.stock?.toString() || '');
  const [criticalStock, setCriticalStock] = useState(product?.critical_stock?.toString() || '');
  const [moderateStock, setModerateStock] = useState(product?.moderate_stock?.toString() || '');
  const promoFromProduct = product?.promo_end_at && new Date(product.promo_end_at).getTime() <= Date.now()
    ? null : product?.discount_percentage;
  const [discountPercentage, setDiscountPercentage] = useState(promoFromProduct?.toString() || '');
  const [isPromo, setIsPromo] = useState(() => !!promoFromProduct);
  const [promoStartAt, setPromoStartAt] = useState(product?.promo_start_at || '');
  const [promoEndAt, setPromoEndAt] = useState(product?.promo_end_at || '');
  const [promoStartDate, setPromoStartDate] = useState(() => product?.promo_start_at ? new Date(product.promo_start_at) : new Date());
  const [promoEndDate, setPromoEndDate] = useState(() => product?.promo_end_at ? new Date(product.promo_end_at) : new Date());
  const [promoStartTime, setPromoStartTime] = useState(() => product?.promo_start_at ? new Date(product.promo_start_at) : new Date(new Date().setHours(8, 0, 0, 0)));
  const [promoEndTime, setPromoEndTime] = useState(() => product?.promo_end_at ? new Date(product.promo_end_at) : new Date(new Date().setHours(18, 0, 0, 0)));
  const [showPromoDateModal, setShowPromoDateModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [productType, setProductType] = useState<'unit' | 'bulk' | 'per_meter'>(product?.is_bulk ? 'bulk' : product?.is_per_meter ? 'per_meter' : 'unit');
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'g'>('kg');
  const isBulk = productType === 'bulk';
  const isPerMeter = productType === 'per_meter';
  useEffect(() => {
    if (isBulk && product?.stock != null) {
      if (selectedUnit === 'kg') {
        setQuantity((product.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      } else {
        setQuantity(product.stock.toString());
      }
    }
  }, [selectedUnit, isBulk]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);

  const criticalBlink = useRef(new Animated.Value(1)).current;
  const moderateBlink = useRef(new Animated.Value(1)).current;
  const promoGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const critAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(criticalBlink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(criticalBlink, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    const modAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(moderateBlink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(moderateBlink, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    critAnim.start();
    modAnim.start();
    return () => { critAnim.stop(); modAnim.stop(); };
  }, [criticalBlink, moderateBlink]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(promoGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(promoGlow, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [promoGlow]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', /* istanbul ignore next */ async () => {
      setSearchText('');
      setActiveCategory(product?.category_id || null);
      setCurrentPhotoIndex(0);
      setName(product?.name || '');
      setDescription(product?.description || '');
      setPrice(product?.price?.toString() || '');
      setQuantity(product?.stock?.toString() || '');
      setCriticalStock(product?.critical_stock?.toString() || '');
      setModerateStock(product?.moderate_stock?.toString() || '');
      const paramsPromoExpired = product?.promo_end_at && new Date(product.promo_end_at).getTime() <= Date.now();
      setDiscountPercentage(paramsPromoExpired ? '' : (product?.discount_percentage?.toString() || ''));
      setIsPromo(!paramsPromoExpired && !!product?.discount_percentage);
      setPromoStartAt(paramsPromoExpired ? '' : (product?.promo_start_at || ''));
      setPromoEndAt(paramsPromoExpired ? '' : (product?.promo_end_at || ''));
      setPromoStartDate(paramsPromoExpired ? new Date() : (product?.promo_start_at ? new Date(product.promo_start_at) : new Date()));
      setPromoEndDate(paramsPromoExpired ? new Date() : (product?.promo_end_at ? new Date(product.promo_end_at) : new Date()));
      setPromoStartTime(paramsPromoExpired ? new Date(new Date().setHours(8, 0, 0, 0)) : (product?.promo_start_at ? new Date(product.promo_start_at) : new Date(new Date().setHours(8, 0, 0, 0))));
      setPromoEndTime(paramsPromoExpired ? new Date(new Date().setHours(18, 0, 0, 0)) : (product?.promo_end_at ? new Date(product.promo_end_at) : new Date(new Date().setHours(18, 0, 0, 0))));
      const newType: 'unit' | 'bulk' | 'per_meter' = product?.is_bulk ? 'bulk' : product?.is_per_meter ? 'per_meter' : 'unit';
      setProductType(newType);
      setSelectedUnit('kg');
      /* istanbul ignore next */ if (newType === 'bulk' && product?.stock != null) {
        setQuantity((product.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
      }
      setIsEditingName(false);
      setIsEditingDesc(false);
      setIsEditingPrice(false);
      setIsEditingQty(false);
      
      /* istanbul ignore next */ if (product?.id) {
        // Fetch fresh data to guarantee we don't have stale route params
        const { data } = await supabase.from('products').select('*').eq('id', product.id).single();
        if (data) {
          if (data.image_url) {
            setPhotos(getAllImageUrls(data.image_url).map(u => ({ uri: u, base64: null })));
          } else {
            setPhotos([]);
          }
          setName(data.name || '');
          setDescription(data.description || '');
          setPrice(data.price?.toString() || '');
          setCriticalStock(data.critical_stock?.toString() || '');
          setModerateStock(data.moderate_stock?.toString() || '');
          const dbPromoExpired = data.promo_end_at && new Date(data.promo_end_at).getTime() <= Date.now();
          setDiscountPercentage(dbPromoExpired ? '' : (data.discount_percentage?.toString() || ''));
          setIsPromo(!dbPromoExpired && !!data.discount_percentage);
          setPromoStartAt(dbPromoExpired ? '' : (data.promo_start_at || ''));
          setPromoEndAt(dbPromoExpired ? '' : (data.promo_end_at || ''));
          setPromoStartDate(dbPromoExpired ? new Date() : (data.promo_start_at ? new Date(data.promo_start_at) : new Date()));
          setPromoEndDate(dbPromoExpired ? new Date() : (data.promo_end_at ? new Date(data.promo_end_at) : new Date()));
          setPromoStartTime(dbPromoExpired ? new Date(new Date().setHours(8, 0, 0, 0)) : (data.promo_start_at ? new Date(data.promo_start_at) : new Date(new Date().setHours(8, 0, 0, 0))));
          setPromoEndTime(dbPromoExpired ? new Date(new Date().setHours(18, 0, 0, 0)) : (data.promo_end_at ? new Date(data.promo_end_at) : new Date(new Date().setHours(18, 0, 0, 0))));
          const updatedType: 'unit' | 'bulk' | 'per_meter' = data.is_bulk ? 'bulk' : data.is_per_meter ? 'per_meter' : 'unit';
          setProductType(updatedType);
          if (updatedType === 'bulk' && data.stock != null) {
            setQuantity((data.stock / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
          } else {
            setQuantity(data.stock?.toString() || '');
          }
        } else {
          setPhotos([]);
        }
      } else {
        setPhotos([]);
      }
    });
    return unsubscribe;
  }, [navigation, product]);

  useEffect(() => {
    if (!promoEndAt) return;
    const interval = setInterval(() => {
      if (new Date(promoEndAt).getTime() <= Date.now()) {
        setIsPromo(false);
        setDiscountPercentage('');
        setPromoStartAt('');
        setPromoEndAt('');
        setShowPromoDateModal(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [promoEndAt]);

  const handleSelectPhoto = () => setShowImagePickerOptions(true);

  const openCamera = async () => {
    setShowImagePickerOptions(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Você precisa permitir o acesso à câmera para tirar uma foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], allowsEditing: false, quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos(prev => { const next = [...prev, { uri: asset.uri, base64: asset.base64 || null }]; setCurrentPhotoIndex(next.length - 1); return next; });
    }
  };

  const openGallery = async () => {
    setShowImagePickerOptions(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Você precisa permitir o acesso à galeria para selecionar uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: false, quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos(prev => { const next = [...prev, { uri: asset.uri, base64: asset.base64 || null }]; setCurrentPhotoIndex(next.length - 1); return next; });
    }
  };

  const handleConfirm = async () => {
    if (!name || !price || !quantity || !criticalStock || !moderateStock) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios, incluindo estoque crítico e estoque moderado.');
      return;
    }
    if (!product?.id) {
      Alert.alert('Erro', 'Nenhum produto selecionado para edição.');
      return;
    }
    
    const mappedImages: string[] = [];
    for (const p of photos) {
      if (p.base64) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, decode(p.base64), { contentType: 'image/jpeg' });
        
        /* istanbul ignore next */ if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
          continue;
        }
        
        /* istanbul ignore next */ if (uploadData) {
          const { data } = supabase.storage.from('products').getPublicUrl(uploadData.path);
          mappedImages.push(data.publicUrl);
        }
      } else {
        mappedImages.push(p.uri);
      }
    }
    const parsedStock = isBulk
      ? (selectedUnit === 'kg' ? parseFloat(quantity.replace(',', '.')) * 1000 : parseInt(quantity, 10))
      : isPerMeter
        ? parseFloat(quantity.replace(',', '.'))
        : parseInt(quantity, 10);
    const updateData: any = {
      name, description,
      price: parseFloat(price.replace(',', '.')),
      stock: parsedStock,
      active: parsedStock > 0,
      is_bulk: isBulk,
      is_per_meter: isPerMeter,
      category_id: activeCategory,
      image_url: mappedImages.length > 0 ? JSON.stringify(mappedImages) : null,
    };
    /* istanbul ignore next */ if (criticalStock) updateData.critical_stock = parseInt(criticalStock, 10);
    /* istanbul ignore else */ else updateData.critical_stock = null;
    /* istanbul ignore next */ if (moderateStock) updateData.moderate_stock = parseInt(moderateStock, 10);
    /* istanbul ignore else */ else updateData.moderate_stock = null;
    /* istanbul ignore next */ if (discountPercentage) updateData.discount_percentage = parseInt(discountPercentage, 10);
    /* istanbul ignore else */ else updateData.discount_percentage = null;
    updateData.promo_start_at = promoStartAt || null;
    updateData.promo_end_at = promoEndAt || null;
    const { error } = await supabase.from('products').update(updateData).eq('id', product.id);
    if (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o produto.');
      console.error(error);
    } else {
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Gerenciar') }
      ]);
    }
  };

  const removePhoto = () => {
    const newPhotos = [...photos];
    newPhotos.splice(currentPhotoIndex, 1);
    setPhotos(newPhotos);
    setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
  };

  const confirmPromoDateTime = () => {
    const start = new Date(promoStartDate);
    start.setHours(promoStartTime.getHours(), promoStartTime.getMinutes(), 0, 0);
    const end = new Date(promoEndDate);
    end.setHours(promoEndTime.getHours(), promoEndTime.getMinutes(), 0, 0);
    setPromoStartAt(start.toISOString());
    setPromoEndAt(end.toISOString());
    setShowPromoDateModal(false);
  };

  const handleEndPromo = () => {
    setShowConfirmEndPromoModal(true);
  };

  const confirmEndPromo = async () => {
    if (product?.id) {
      const { error } = await supabase.from('products').update({
        discount_percentage: null,
        promo_start_at: null,
        promo_end_at: null
      }).eq('id', product.id);
      
      if (error) {
        Alert.alert('Erro', 'Não foi possível encerrar a promoção.');
        setShowConfirmEndPromoModal(false);
        return;
      }
    }
    
    setIsPromo(false);
    setDiscountPercentage('');
    setPromoStartAt('');
    setPromoEndAt('');
    setPromoStartDate(new Date());
    setPromoEndDate(new Date());
    setShowConfirmEndPromoModal(false);
    Alert.alert('Sucesso', 'Promoção encerrada com sucesso!');
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'Selecionar';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const labelColor = isDarkMode ? '#FFFFFF' : '#8A7268';
  const sepColor = isDarkMode ? 'rgba(255,255,255,0.2)' : '#8A7268';

  return {
    colors, isDarkMode, navigation,
    product,
    searchText, setSearchText,
    activeCategory, setActiveCategory,
    showImagePickerOptions, setShowImagePickerOptions,
    photos, currentPhotoIndex, setCurrentPhotoIndex,
    name, setName,
    description, setDescription,
    price, setPrice,
    quantity, setQuantity,
    criticalStock, setCriticalStock,
    moderateStock, setModerateStock,
    productType, setProductType,
    isBulk, isPerMeter,
    selectedUnit, setSelectedUnit,
    criticalBlink, moderateBlink, promoGlow,
    discountPercentage, setDiscountPercentage, isPromo, setIsPromo,
    promoStartAt, setPromoStartAt, promoEndAt, setPromoEndAt,
    promoStartDate, setPromoStartDate, promoEndDate, setPromoEndDate,
    promoStartTime, setPromoStartTime, promoEndTime, setPromoEndTime,
    showPromoDateModal, setShowPromoDateModal,
    showTimePicker, setShowTimePicker, showDatePicker, setShowDatePicker,
    confirmPromoDateTime, formatDateTime, handleEndPromo, confirmEndPromo,
    showConfirmEndPromoModal, setShowConfirmEndPromoModal,
    isEditingName, setIsEditingName,
    isEditingDesc, setIsEditingDesc,
    isEditingPrice, setIsEditingPrice,
    isEditingQty, setIsEditingQty,
    nameRef, descRef, priceRef, qtyRef,
    handleSelectPhoto, openCamera, openGallery, handleConfirm, removePhoto,
    labelColor, sepColor,
  };
}
