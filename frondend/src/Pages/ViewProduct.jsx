import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function ViewProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const navigate = useNavigate();

  const fetchProduct = () => {
    API
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return <div className="text-center p-10">Loading...</div>;

  const images = [product.image];
  if (product.backImage) images.push(product.backImage);


  const getLoggedInUser = () => {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));
    return user;
  };


  const handleAddToCart = async () => {
    const user = getLoggedInUser();
    if (!user) {
      toast.warn("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.warn("Please select a size before adding to cart!");
      return;
    }

    const productId = product._id || product.id;
    const isActiveOffer = product.salePrice && new Date(product.offerExpiry) > new Date();
    const finalPrice = isActiveOffer ? Number(product.salePrice) : Number(product.price);

    const cartLocal = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cartLocal.find(
      (item) => (item._id || item.id) === productId && item.size === selectedSize
    );

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      existing.price = finalPrice;
    } else {
      cartLocal.push({ ...product, price: finalPrice, quantity: 1, size: selectedSize });
    }

    localStorage.setItem("cart", JSON.stringify(cartLocal));

    try {
      const userId = user._id || user.id;
      // Fetch latest cart to merge or just update
      await API.get(`/cart?userId=${userId}`);

      await API.patch(`/cart/${userId}`, {
        items: cartLocal,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to persist cart:", err);
      toast.error(" something went wrong ");
    }

    toast.success(`${product.team} added to cart!`);


    window.dispatchEvent(new Event("cartUpdated"));
  };


  const handleBuyNow = () => {
    const user = getLoggedInUser();
    if (!user) {
      toast.warn("Please log in to buy products.");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.warn("Please select a size before buying!");
      return;
    }

    const isActiveOffer = product.salePrice && new Date(product.offerExpiry) > new Date();
    const finalPrice = isActiveOffer ? Number(product.salePrice) : Number(product.price);

    navigate("/checkout", {
      state: { products: [{ ...product, price: finalPrice, quantity: 1, size: selectedSize }] },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col lg:flex-row gap-12">

      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[600px]">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            className="rounded-2xl shadow-lg"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img}
                  alt={`${product.team} view ${i + 1}`}
                  className="w-full h-[500px] object-contain bg-gray-100 rounded-2xl"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>


      <div className="flex-1 space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">{product.team}</h1>

        <div>
          {product.salePrice && new Date(product.offerExpiry) > new Date() ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl text-red-600 font-bold">₹ {product.salePrice}</span>
              <span className="text-xl text-gray-400 line-through">₹ {product.price}</span>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold uppercase">Save ₹{product.price - product.salePrice}</span>
            </div>
          ) : (
            <p className="text-3xl text-gray-700 font-bold">₹ {product.price}</p>
          )}
        </div>

        {product.description && (
          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>
        )}


        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Select Size:
            </h3>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-full text-sm font-medium transition ${selectedSize === size
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:border-blue-600"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}


        <div className="flex gap-4 mt-8">
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition font-semibold"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition font-semibold"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewProduct;
