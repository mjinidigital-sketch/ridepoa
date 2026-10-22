import * as React from 'react';
import { startTransition, useState, useCallback, useMemo, memo } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  brand: string;
  color: string;
  size: string;
  features: string[];
}

interface FilterState {
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  ratings: number[];
}

// Memoized product card component to prevent unnecessary re-renders
const ProductCard = memo(({ product }: { product: Product }) => (
  <div className="group overflow-hidden rounded-lg border">
    <div className="relative aspect-square overflow-hidden bg-gray-100">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
      >
        <Heart className="h-4 w-4" />
      </Button>
      {product.originalPrice > product.price && (
        <Badge className="absolute top-2 left-2" variant="destructive">
          Sale
        </Badge>
      )}
    </div>
    <div className="p-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-muted-foreground text-sm">{product.category}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Star className="fill-primary text-primary h-4 w-4" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <p className="text-muted-foreground text-xs">
            {product.reviews} reviews
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-muted-foreground text-sm line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        <Button size="sm" className="h-8">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  </div>
));
ProductCard.displayName = 'ProductCard';

export default function FilterDemo() {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    ratings: [],
  });

  // Sample product data
  const products: Product[] = [
    {
      id: 1,
      name: 'Classic Leather Jacket',
      category: 'Outerwear',
      price: 299,
      originalPrice: 399,
      rating: 4.8,
      reviews: 128,
      image:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      brand: 'Levi&apos;s',
      color: 'Black',
      size: 'M',
      features: ['Water Resistant', 'Genuine Leather'],
    },
    {
      id: 2,
      name: 'Sport Running Shoes',
      category: 'Shoes',
      price: 149,
      originalPrice: 199,
      rating: 4.9,
      reviews: 256,
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      brand: 'Nike',
      color: 'Red',
      size: 'L',
      features: ['Breathable', 'Cushioned Sole'],
    },
    {
      id: 3,
      name: 'Casual Cotton T-Shirt',
      category: 'Clothing',
      price: 29,
      originalPrice: 39,
      rating: 4.5,
      reviews: 192,
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      brand: 'H&M',
      color: 'White',
      size: 'S',
      features: ['100% Cotton', 'Machine Washable'],
    },
    {
      id: 4,
      name: 'Fitness Tracker Watch',
      category: 'Accessories',
      price: 199,
      originalPrice: 249,
      rating: 4.7,
      reviews: 156,
      image:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      brand: 'Under Armour',
      color: 'Black',
      size: 'M',
      features: ['Heart Rate Monitor', 'GPS', 'Water Resistant'],
    },
    {
      id: 5,
      name: 'Winter Puffer Jacket',
      category: 'Outerwear',
      price: 179,
      originalPrice: 229,
      rating: 4.6,
      reviews: 98,
      image:
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      brand: 'New Balance',
      color: 'Blue',
      size: 'XL',
      features: ['Insulated', 'Water Resistant', 'Windproof'],
    },
    {
      id: 6,
      name: 'Slim Fit Jeans',
      category: 'Clothing',
      price: 79,
      originalPrice: 99,
      rating: 4.4,
      reviews: 112,
      image:
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      brand: 'Levi&apos;s',
      color: 'Blue',
      size: 'M',
      features: ['Stretch Denim', 'Slim Fit'],
    },
  ];

  // Filter products based on selected filters - memoized to prevent recalculation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      // Brand filter
      if (
        filters.brands.length > 0 &&
        !filters.brands.includes(product.brand)
      ) {
        return false;
      }

      // Color filter
      if (
        filters.colors.length > 0 &&
        !filters.colors.includes(product.color)
      ) {
        return false;
      }

      // Size filter
      if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
        return false;
      }

      // Rating filter
      if (
        filters.ratings.length > 0 &&
        !filters.ratings.some((rating) => product.rating >= rating)
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    // Use requestAnimationFrame to schedule the update for the next frame
    // This helps prevent UI jank during rapid updates
    requestAnimationFrame(() => {
      setFilters(newFilters);
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <h1 className="mb-6 text-2xl font-bold">Shop Products</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <SidebarFilters onFilterChange={handleFilterChange} />

        {/* Product Grid */}
        <div className="flex-1">
          <div className="text-muted-foreground mb-4 text-sm">
            {filteredProducts.length} products found
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters to find what you&apos;re looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sidebar Filters Component
function SidebarFilters({
  onFilterChange,
}: {
  onFilterChange?: (filters: FilterState) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    ratings: [],
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleFilter = useCallback(
    (type: keyof FilterState, value: string | number) => {
      setFilters((prev) => {
        const currentValues = prev[type] as (string | number)[];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        const updated = { ...prev, [type]: newValues };

        // Count active filters
        let count = 0;
        if (updated.categories.length) count += updated.categories.length;
        if (updated.brands.length) count += updated.brands.length;
        if (updated.colors.length) count += updated.colors.length;
        if (updated.sizes.length) count += updated.sizes.length;
        if (updated.ratings.length) count += updated.ratings.length;

        setActiveFiltersCount(count);

        // Use startTransition to avoid blocking the UI during updates
        startTransition(() => {
          onFilterChange?.(updated);
        });

        return updated;
      });
    },
    [onFilterChange]
  );

  const clearFilters = useCallback(() => {
    const resetFilters: FilterState = {
      categories: [],
      brands: [],
      colors: [],
      sizes: [],
      ratings: [],
    };
    setFilters(resetFilters);
    setActiveFiltersCount(0);
    onFilterChange?.(resetFilters);
  }, [onFilterChange]);

  const categories = [
    'Clothing',
    'Shoes',
    'Accessories',
    'Sportswear',
    'Outerwear',
    'Formal Wear',
    'Casual Wear',
  ];

  const brands = [
    'Nike',
    'Adidas',
    'Puma',
    'Under Armour',
    'New Balance',
    'Levi&apos;s',
    'H&M',
    'Zara',
  ];

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#FFA500' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const ratings = [4, 3, 2, 1];

  const FilterSection = ({
    title,
    children,
    defaultOpen = true,
  }: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between py-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pb-4">{children}</CollapsibleContent>
        <Separator />
      </Collapsible>
    );
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2"
        >
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm lg:hidden">
          <div className="bg-background fixed inset-y-0 right-0 z-50 w-full max-w-xs p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="pr-4">
                {/* Filter Sections */}
                <FilterContent />
              </div>
            </ScrollArea>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear all
              </Button>
              <Button onClick={() => setShowMobileFilters(false)}>
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
        <FilterContent />
      </div>
    </>
  );

  function FilterContent() {
    return (
      <div className="space-y-1">
        <FilterSection title="Categories">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleFilter('categories', category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Brands">
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => toggleFilter('brands', brand)}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Colors">
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <div
                key={color.name}
                className="flex flex-col items-center gap-1"
              >
                <button
                  className={cn(
                    'border-input flex h-8 w-8 items-center justify-center rounded-full border',
                    filters.colors.includes(color.name) && 'ring-primary ring-2'
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => toggleFilter('colors', color.name)}
                >
                  {filters.colors.includes(color.name) && (
                    <Check
                      className={cn(
                        'h-4 w-4',
                        ['White', 'Yellow'].includes(color.name)
                          ? 'text-black'
                          : 'text-white'
                      )}
                    />
                  )}
                </button>
                <span className="text-xs">{color.name}</span>
              </div>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Sizes">
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={filters.sizes.includes(size) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter('sizes', size)}
                className="h-8"
              >
                {size}
              </Button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Rating">
          <div className="space-y-2">
            {ratings.map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.ratings.includes(rating)}
                  onCheckedChange={() => toggleFilter('ratings', rating)}
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="flex items-center text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {Array.from({ length: rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-current text-yellow-400"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                  <span className="ml-1">& Up</span>
                </label>
              </div>
            ))}
          </div>
        </FilterSection>
      </div>
    );
  }
}
