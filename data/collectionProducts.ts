// Catalog imagery: DummyJSON product CDN and Unsplash, stored as remote URLs.
export interface CollectionProduct {
  name: string; category: 'Accessories' | 'Backpacks' | 'Clothing'; subCategory: string;
  price: number; description: string; countInStock: number; isOnSale: boolean; isActive: boolean;
  variants: Array<{ size: string; stock: number }>; image: string; gallery: string[]; createdAt: string; updatedAt: string;
}

const products = [
  {
    "name": "Black Frame Sunglasses",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "price": 1499,
    "description": "Complete your everyday look with the black frame sunglasses. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": true,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.653Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Classic Aviator Sunglasses",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "price": 1699,
    "description": "Complete your everyday look with the classic aviator sunglasses. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Green Accent Sunglasses",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "price": 1899,
    "description": "Complete your everyday look with the green accent sunglasses. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/green-and-black-glasses/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Statement Party Glasses",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "price": 2099,
    "description": "Complete your everyday look with the statement party glasses. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/party-glasses/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Everyday Sunglasses",
    "category": "Accessories",
    "subCategory": "Sunglasses",
    "price": 2299,
    "description": "Complete your everyday look with the everyday sunglasses. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/sunglasses/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Leather Strap Watch",
    "category": "Accessories",
    "subCategory": "Watches",
    "price": 4499,
    "description": "Complete your everyday look with the leather strap watch. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": true,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Classic Dress Watch",
    "category": "Accessories",
    "subCategory": "Watches",
    "price": 5249,
    "description": "Complete your everyday look with the classic dress watch. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Black Dial Watch",
    "category": "Accessories",
    "subCategory": "Watches",
    "price": 5999,
    "description": "Complete your everyday look with the black dial watch. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Moonphase Dress Watch",
    "category": "Accessories",
    "subCategory": "Watches",
    "price": 6749,
    "description": "Complete your everyday look with the moonphase dress watch. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-moonphase/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Everyday Silver Watch",
    "category": "Accessories",
    "subCategory": "Watches",
    "price": 7499,
    "description": "Complete your everyday look with the everyday silver watch. A versatile finishing touch for casual outfits and dressed-up days.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/3.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Everyday Commuter Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 2499,
    "description": "Everyday Commuter Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": true,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "City Explorer Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 2799,
    "description": "City Explorer Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Weekend Travel Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 3099,
    "description": "Weekend Travel Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Heritage Canvas Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 3399,
    "description": "Heritage Canvas Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Trail Adventure Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 3699,
    "description": "Trail Adventure Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1473181488821-2d23949a045a?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Urban Essentials Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 3999,
    "description": "Urban Essentials Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": true,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Campus Daypack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 4299,
    "description": "Campus Daypack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Compact Daily Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 4599,
    "description": "Compact Daily Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Explorer Travel Pack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 4899,
    "description": "Explorer Travel Pack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1585916420730-d7f95e942d43?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Everyday Carry Backpack",
    "category": "Backpacks",
    "subCategory": "Backpacks",
    "price": 5199,
    "description": "Everyday Carry Backpack is a practical companion for everyday plans, commuting, and days out. Discover a fresh addition to your daily carry.",
    "countInStock": 12,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "One Size",
        "stock": 12
      }
    ],
    "image": "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=900&q=80",
    "gallery": [],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Blue Check Shirt",
    "category": "Clothing",
    "subCategory": "Shirts",
    "price": 1999,
    "description": "Blue Check Shirt brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": true,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.654Z",
    "updatedAt": "2026-10-17T20:36:11.654Z"
  },
  {
    "name": "Everyday Graphic T-Shirt",
    "category": "Clothing",
    "subCategory": "Shirts",
    "price": 2349,
    "description": "Everyday Graphic T-Shirt brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Classic Plaid Shirt",
    "category": "Clothing",
    "subCategory": "Shirts",
    "price": 2699,
    "description": "Classic Plaid Shirt brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Short Sleeve Cotton Shirt",
    "category": "Clothing",
    "subCategory": "Shirts",
    "price": 3049,
    "description": "Short Sleeve Cotton Shirt brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Weekend Check Shirt",
    "category": "Clothing",
    "subCategory": "Shirts",
    "price": 3399,
    "description": "Weekend Check Shirt brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Evening Black Gown",
    "category": "Clothing",
    "subCategory": "Dresses",
    "price": 3499,
    "description": "Evening Black Gown brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": true,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Leather-Look Skirt Set",
    "category": "Clothing",
    "subCategory": "Dresses",
    "price": 3949,
    "description": "Leather-Look Skirt Set brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Black Corset Skirt Set",
    "category": "Clothing",
    "subCategory": "Dresses",
    "price": 4399,
    "description": "Black Corset Skirt Set brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/corset-with-black-skirt/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Everyday Printed Dress",
    "category": "Clothing",
    "subCategory": "Dresses",
    "price": 4849,
    "description": "Everyday Printed Dress brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/dress-pea/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  },
  {
    "name": "Red & Black Two-Piece Set",
    "category": "Clothing",
    "subCategory": "Dresses",
    "price": 5299,
    "description": "Red & Black Two-Piece Set brings an easy-to-style look to your wardrobe. Pair with your favorite everyday accessories and choose your fit from the available sizes.",
    "countInStock": 20,
    "isOnSale": false,
    "isActive": true,
    "variants": [
      {
        "size": "S",
        "stock": 5
      },
      {
        "size": "M",
        "stock": 5
      },
      {
        "size": "L",
        "stock": 5
      },
      {
        "size": "XL",
        "stock": 5
      }
    ],
    "image": "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/1.webp",
    "gallery": [
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/3.webp",
      "https://cdn.dummyjson.com/product-images/womens-dresses/marni-red-&-black-suit/4.webp"
    ],
    "createdAt": "2026-10-17T20:36:11.655Z",
    "updatedAt": "2026-10-17T20:36:11.655Z"
  }
] satisfies CollectionProduct[];

export default products;
