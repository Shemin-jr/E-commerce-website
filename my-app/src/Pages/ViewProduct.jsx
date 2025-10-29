import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function ViewProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <div className="text-center p-10">Loading...</div>;

  const images = [product.image];
  if (product.backImage) images.push(product.backImage);

  // ✅ Helper: Check login
  const getLoggedInUser = () => {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));
    return user;
  };

  const handleAddToCart = async () => {
    const user = getLoggedInUser();
    if (!user) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size before adding to cart!");
      return;
    }

    const cartLocal = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cartLocal.find(
      (item) => item.id === product.id && item.size === selectedSize
    );

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cartLocal.push({ ...product, quantity: 1, size: selectedSize });
    }

    localStorage.setItem("cart", JSON.stringify(cartLocal));

    try {
      const res = await axios.get(`http://localhost:5000/carts?userId=${user.id}`);
      const items = cartLocal;
      if (res.data && res.data.length > 0) {
        const cartRecord = res.data[0];
        await axios.patch(`http://localhost:5000/carts/${cartRecord.id}`, {
          items,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await axios.post(`http://localhost:5000/carts`, {
          userId: user.id,
          items,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Failed to persist cart:", err);
    }

    // ✅ Trigger cart icon update on Navbar (no navigation)
    window.dispatchEvent(new Event("cartUpdated"));
    alert("✅ Added to cart!");
  };

  const handleBuyNow = () => {
    const user = getLoggedInUser();
    if (!user) {
      alert("Please log in to buy products.");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size before buying!");
      return;
    }

    navigate("/checkout", {
      state: { product: { ...product, quantity: 1, size: selectedSize } },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col lg:flex-row gap-12">
      {/* Image Slider */}
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

      {/* Product Details */}
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">{product.team}</h1>
        <p className="text-2xl text-gray-700 font-semibold">₹ {product.price}</p>

        {product.description && (
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Size:</h3>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-full text-sm font-medium transition ${
                    selectedSize === size
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
