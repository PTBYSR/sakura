
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import Image from "next/image";

const ecoCard = [
  {
    title: "Boat Headphone",
    subheader: "September 14, 2023",
    photo: '/images/products/s4.jpg',
    salesPrice: 375,
    price: 285,
    rating: 4,
  },
  {
    title: "MacBook Air Pro",
    subheader: "September 14, 2023",
    photo: '/images/products/s5.jpg',
    salesPrice: 650,
    price: 900,
    rating: 5,
  },
  {
    title: "Red Valvet Dress",
    subheader: "September 14, 2023",
    photo: '/images/products/s7.jpg',
    salesPrice: 150,
    price: 200,
    rating: 3,
  },
  {
    title: "Cute Soft Teddybear",
    subheader: "September 14, 2023",
    photo: '/images/products/s11.jpg',
    salesPrice: 285,
    price: 345,
    rating: 2,
  },
];

const Blog = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {ecoCard.map((product, index) => (
        <div key={index}>
          <BlankCard>
            <Link href="/" className="block">
              <div className="relative w-full h-[250px]">
                <Image src={product.photo} alt={product.title} fill className="object-cover rounded-t" />
              </div>
            </Link>
            <button className="absolute bottom-[75px] right-[15px] w-9 h-9 rounded-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white flex items-center justify-center" title="Add To Cart">
              <ShoppingCart className="w-4 h-4" />
            </button>
            <div className="p-4 pt-3">
              <div className="text-white font-semibold text-base">{product.title}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-white font-semibold">${product.price}</div>
                  <div className="text-gray-400 line-through">${product.salesPrice}</div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
            </div>
          </BlankCard>
        </div>
      ))}
    </div>
  );
};

export default Blog;
