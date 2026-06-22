import { useState, useEffect } from 'react';
import { supabase } from '../../../../data/datasources/supabase/client';
import { fetchActiveCategories } from '../../../../services/categoryService';

export default function useRelatedProducts(product: any) {
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, stock, active, category_id, created_at, image_url, is_bulk, is_per_meter, discount_percentage')
        .eq('active', true)
        .neq('id', product.id);

      if (!error && data) {
        const currentName = (product.name || '').toLowerCase();
        const currentDesc = (product.description || '').toLowerCase();
        let matchedKeywords: string[] = [];

        try {
          const allCategories = await fetchActiveCategories();
          for (const cat of allCategories) {
            if (cat.keywords.some(kw => currentName.includes(kw.toLowerCase()) || currentDesc.includes(kw.toLowerCase()))) {
              matchedKeywords = [...matchedKeywords, ...cat.keywords];
            }
          }
        } catch (_) {}

        let filtered = data.filter(p => {
          const name = (p.name || '').toLowerCase();
          const description = (p.description || '').toLowerCase();
          return matchedKeywords.some(kw =>
            name.includes(kw.toLowerCase()) ||
            description.includes(kw.toLowerCase())
          );
        });

        if (filtered.length === 0) {
          const cleanText = `${currentName} ${currentDesc}`
            .replace(/[^\w\sà-úÀ-Ú]/g, '')
            .toLowerCase();
          const words = cleanText
            .split(/\s+/)
            .filter((w: string) => w.length > 3);

          filtered = data.filter(p => {
            const name = (p.name || '').toLowerCase();
            const description = (p.description || '').toLowerCase();
            return words.some((w: string) =>
              name.includes(w) ||
              description.includes(w)
            );
          });
        }

        filtered.sort((a, b) => {
          const aDisc = a.discount_percentage ? 1 : 0;
          const bDisc = b.discount_percentage ? 1 : 0;
          return bDisc - aDisc;
        });
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingRelated(false);
    }
  };

  useEffect(() => {
    fetchRelatedProducts();
  }, [product]);

  return { relatedProducts, loadingRelated };
}
