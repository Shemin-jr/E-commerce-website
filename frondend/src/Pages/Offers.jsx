import React, { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await API.get("/offers/global");
      setOffers(response.data.offers);
    } catch (error) {
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Special Offers</h1>
          <p className="text-lg text-gray-600">
            Discover amazing deals and discounts on your favorite jerseys
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Active Offers</h2>
            <p className="text-gray-600">Check back later for exciting deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <div className="text-3xl font-bold mb-2">
                    {offer.type === "percentage"
                      ? `${offer.discountPercent}% OFF`
                      : `$${offer.discountAmount} OFF`}
                  </div>
                  <h3 className="text-xl font-semibold">{offer.title}</h3>
                </div>

                <div className="p-6">
                  {offer.description && (
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {offer.minPurchase > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Min. Purchase:</span>
                        <span className="ml-2">${offer.minPurchase}</span>
                      </div>
                    )}

                    {offer.type === "percentage" && offer.maxDiscount && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Max. Discount:</span>
                        <span className="ml-2">${offer.maxDiscount}</span>
                      </div>
                    )}

                    {offer.expiresAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Expires:</span>
                        <span className="ml-2">
                          {new Date(offer.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Applicable to:</span>
                      <span className="ml-2 capitalize">{offer.applicableTo.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {offer.code && (
                    <div className="border-2 border-dashed border-indigo-200 rounded-lg p-4 bg-indigo-50">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Use Code:</div>
                        <div className="text-2xl font-mono font-bold text-indigo-600 mb-3">
                          {offer.code}
                        </div>
                        <button
                          onClick={() => copyCode(offer.code)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                        >
                          Copy Code
                        </button>
                      </div>
                    </div>
                  )}

                  {!offer.code && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Automatic discount applied at checkout
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use Offers</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Browse our amazing offers above</p>
              <p>• Copy the coupon code or note automatic discounts</p>
              <p>• Add items to cart and proceed to checkout</p>
              <p>• Enter the code at checkout to apply the discount</p>
              <p>• Enjoy your savings!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Offers;