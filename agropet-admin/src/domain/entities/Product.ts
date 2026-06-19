import { Price } from '../value-objects/Price';
import { Stock } from '../value-objects/Stock';

export class Product {
  public readonly priceVO: Price;
  public readonly stockVO: Stock;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly categoryId: string,
    public readonly active: boolean,
    public readonly imageUrl?: string,
    public readonly description?: string,
    public readonly criticalStock?: number,
    public readonly moderateStock?: number,
    public readonly discountPercentage?: number,
    public readonly promoStartAt?: string,
    public readonly promoEndAt?: string
  ) {
    this.priceVO = new Price(price);
    this.stockVO = new Stock(stock);
  }

  get effectiveCriticalStock(): number {
    return this.criticalStock ?? 10;
  }

  get effectiveModerateStock(): number {
    return this.moderateStock ?? 29;
  }

  get stockLevel(): 'critical' | 'moderate' | 'ok' {
    if (this.stock < this.effectiveCriticalStock) return 'critical';
    if (this.stock <= this.effectiveModerateStock) return 'moderate';
    return 'ok';
  }

  hasLowStock(warningMargin: number): boolean {
    return this.stockVO.isCritical(warningMargin);
  }

  isOutOfStock(): boolean {
    return this.stockVO.isOutOfStock();
  }

  deactivate(): Product {
    return new Product(
      this.id,
      this.name,
      this.price,
      this.stock,
      this.categoryId,
      false,
      this.imageUrl,
      this.description,
      this.criticalStock,
      this.moderateStock,
      this.discountPercentage,
      this.promoStartAt,
      this.promoEndAt
    );
  }

  validatePhotos(): boolean {
    if (!this.imageUrl) return true;
    try {
      if (this.imageUrl.startsWith('[') && this.imageUrl.endsWith(']')) {
        const parsed = JSON.parse(this.imageUrl);
        if (Array.isArray(parsed)) {
          return parsed.length <= 5;
        }
      }
      return true; // Single image url
    } catch {
      return true; // Not a valid JSON, treat as a single string
    }
  }
}
