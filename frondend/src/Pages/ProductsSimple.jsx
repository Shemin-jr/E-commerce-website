import React, { useEffect, useState } from "react";
import API from "../api/api";

function ProductsSimple() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            console.log('🔍 Fetching products...');
            try {
                const res = await API.get("/products");
                console.log('✅ Products received:', res.data.length);
                setProducts(res.data);
                setError(null);
            } catch (err) {
                console.error('❌ Error fetching products:', err);
                setError(err.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center text-green-600 font-bold text-2xl">
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center text-red-600 font-bold text-2xl">
                Error: {error}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="min-h-screen flex justify-center items-center text-gray-600 font-bold text-2xl">
                No products found.
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-20">
            <h1 className="text-4xl font-bold text-center mb-10">Products ({products.length})</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((item) => {
                    const productId = item._id || item.id;

                    return (
                        <div
                            key={productId}
                            className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300"
                        >
                            <img
                                src={item.image}
                                alt={item.team}
                                className="w-full h-80 object-cover"
                            />

                            <div className="p-6 text-center">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.team}</h3>
                                <p className="text-gray-600 mb-1">Category: {item.category}</p>
                                <p className="text-green-600 font-semibold text-lg mb-4">₹ {item.price?.toFixed(2)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProductsSimple;
