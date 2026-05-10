export type PromotionType =
  | 'discount'
  | 'hot'
  | 'new'
  | 'mortgage'
  | 'installment'
  | 'limited'
  | 'custom';

export type PromotionVariant = 'grid' | 'slider' | 'list';

export interface Promotion {
  id: string;
  type: PromotionType;
  /** i18n key prefix, e.g. "promotions.items.launch". Resolves to {title,subtitle,description,badge,cta}. */
  i18nKey: string;
  image?: string;
  ctaHref?: string;
  /** Page locations where this promo can appear, e.g. ['home','global','section']. */
  locations?: string[];
  projectId?: string;
  siteId?: string;
  /** ISO date strings */
  startsAt?: string;
  endsAt?: string;
  priority?: number;
  /** popup behavior */
  popup?: {
    enabled?: boolean;
    showAfterSeconds?: number;
    showOncePerDay?: boolean;
    showOnHomepageOnly?: boolean;
    exitIntent?: boolean;
  };
  /** top banner behavior */
  topBanner?: {
    enabled?: boolean;
    sticky?: boolean;
  };
}

export interface PromotionFilter {
  location?: string;
  projectId?: string;
  siteId?: string;
  type?: PromotionType[];
  sort?: 'priority' | 'newest' | 'endingSoon';
  limit?: number;
}
