import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Tag, DollarSign, CheckCircle, X, CreditCard, Ticket, AlertCircle, Loader } from "lucide-react";
import { registerForEvent, getEventById, confirmRegistrationPayment } from "../../services/eventService";
import { getMyProfile } from "../../services/studentService";

function EventRegistration({ event, onClose }) {
  const [registrationStep, setRegistrationStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    year: "1",
    agreeTerms: false,
  });

  const [paymentData, setPaymentData] = useState({
    method: "card",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  // If no event prop is passed, allow this component to operate as a page
  // that reads :id from the URL and fetches the event itself.
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!event && routeId) {
        setLoadingEvent(true);
        try {
          const e = await getEventById(routeId);
          // normalize shape similar to previous mapping
          setEventData({
            id: e._id,
            title: e.title,
            description: e.description || "",
            date: e.date,
            time: e.time,
            venue: e.venue,
            category: e.category,
            capacity: e.capacity,
            registered: e.registrations,
            price: e.price || 0,
          });
        } catch (err) {
          console.error("Error loading event:", err);
        } finally {
          setLoadingEvent(false);
        }
      }
    };
    load();
  }, [routeId, event]);

  const currentEvent = event || eventData;
  if (!currentEvent && loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading event details...</div>
      </div>
    );
  }

  if (!currentEvent && !loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Event not found</div>
      </div>
    );
  }

  const isPaid = currentEvent.price && currentEvent.price > 0;
  const processingFee = 10;
  const totalAmount = isPaid ? currentEvent.price + processingFee : 0;

  const handleNext = () => {
    if (registrationStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.department) {
        alert("Please fill all required fields");
        return;
      }
      if (!formData.agreeTerms) {
        alert("Please agree to terms");
        return;
      }
  isPaid ? setRegistrationStep(2) : completeRegistration();
    } else if (registrationStep === 2) {
      processPayment();
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (registrationId, amount) => {
    setIsProcessing(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) {
        alert('Failed to load Razorpay SDK');
        setIsProcessing(false);
        return;
      }

      // Determine amount to use (in ₹) and validate
      const amountToUse = Number(amount ?? totalAmount);
      if (!amountToUse || Number.isNaN(amountToUse) || amountToUse <= 0) {
        throw new Error(`Invalid amount for payment: ${amountToUse}`);
      }

      // Create Razorpay order on backend
      const orderRes = await fetch('http://localhost:5000/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToUse }),
      });

      if (!orderRes.ok) {
        const text = await orderRes.text();
        throw new Error(`Order creation failed: ${orderRes.status} ${orderRes.statusText} - ${text}`);
      }
      const orderData = await orderRes.json();
      if (!orderData || !orderData.id) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || window?.__env?.RAZORPAY_KEY_ID || 'rzp_test_RRRxgh4th0Uaoy',
        amount: orderData.amount,
        currency: orderData.currency,
        name: currentEvent.title,
        description: 'Event Registration',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // verify payment on backend and attach registrationId
            const verifyRes = await fetch('http://localhost:5000/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                registrationId,
              }),
            });
            if (!verifyRes.ok) {
              const txt = await verifyRes.text();
              throw new Error(`Verification failed: ${verifyRes.status} ${verifyRes.statusText} - ${txt}`);
            }
            const verifyJson = await verifyRes.json();
            if (verifyJson && verifyJson.success) {
              setRegistrationStep(3);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error', err);
            alert('Payment verification failed. Contact support.');
            setRegistrationStep(1);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          registrationId: String(registrationId),
        },
        theme: { color: '#F97316' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay flow error', err);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
      setRegistrationStep(1);
    }
  };

  const completeRegistration = () => {
    // Call backend to register the user for this event
    (async () => {
      setIsProcessing(true);
      try {
        // try to get current user id from profile (requires auth token in localStorage)
        let userId = null;
        try {
          const profile = await getMyProfile();
          userId = profile?.id;
        } catch (err) {
          // ignore profile fetch error; fallback to null
        }

        // send registration payload
        const payload = {
          userId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          year: formData.year,
          amount: isPaid ? totalAmount : 0
        };

        const res = await registerForEvent(currentEvent.id || currentEvent._id, payload);

        if (res && res.payment) {
          // Payment required: step to payment and open Razorpay
          setRegistrationStep(2);
          if (res.registrationId) {
            // call processPayment with registrationId and amount
            await processPayment(res.registrationId, res.amount || totalAmount);
          } else {
            alert('Registration created but missing registrationId for payment');
            setRegistrationStep(1);
            setIsProcessing(false);
          }
        } else {
          setRegistrationStep(3);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Registration failed:", error);
        alert(error?.response?.data?.message || "Registration failed. Please try again.");
        setIsProcessing(false);
      }
    })();
  };

  const handleClose = () => {
    if (typeof onClose === "function") return onClose();
    // fallback when used as a page
    navigate("/student/allevents");
  };

  const isPage = !onClose && (routeId || event);

  const InnerCard = (
    <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-center justify-between z-10">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {registrationStep === 1 && "Event Registration"}
            {registrationStep === 2 && "Payment Details"}
            {registrationStep === 3 && "Registration Successful!"}
          </h2>
          <p className="text-white/60 text-sm">{currentEvent?.title}</p>
        </div>
        <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="p-6">
        {/* Step 1: Registration */}
        {registrationStep === 1 && (
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40"
            />
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40"
            />
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-white/80 text-sm">I agree to terms and conditions</span>
            </label>
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl"
            >
              {isPaid ? "Proceed to Payment" : "Complete Registration"}
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {registrationStep === 2 && isPaid && (
          <div className="space-y-6">
            <p className="text-white/80">Total Amount: ₹{totalAmount}</p>
            <div className="grid grid-cols-3 gap-3">
              {["card", "upi", "netbanking"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentData({ ...paymentData, method })}
                  className={`p-4 rounded-xl border-2 ${
                    paymentData.method === method ? "border-purple-500 bg-purple-500/20" : "border-white/10 bg-white/5"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl"
            >
              Pay ₹{totalAmount}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {registrationStep === 3 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
            <p className="text-white/60">{isPaid ? `Payment of ₹${totalAmount} completed.` : "Your registration is confirmed."}</p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-white/10 text-white py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isPage) {
    // Render inline page card (centered within page content)
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">{InnerCard}</div>
      </div>
    );
  }

  // Default: modal overlay
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">{InnerCard}</div>
  );
}

export default EventRegistration;
