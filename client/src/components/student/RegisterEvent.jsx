import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  X,
  Ticket,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  registerForEvent,
  getEventById,
  getMyProfile,
  createEventPaymentOrder,
  verifyEventPayment,
} from "../../services/studentService";
import { useToast } from "../../pages/common/Toast";

/**
 * EventRegistration
 * - Handles free and paid events (Razorpay)
 * - Uses studentService.createEventPaymentOrder & verifyEventPayment for paid flow
 * - Uses studentService.registerForEvent for free-flow (or as fallback)
 *
 * Notes:
 * - Ensure frontend env VITE_RAZORPAY_KEY_ID is set
 * - Ensure backend routes /api/payment/register-event and /api/payment/verify-registration exist
 */

function EventRegistration({ event, onClose }) {
  const [registrationStep, setRegistrationStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    year: "1",
    agreeTerms: false,
  });

  const [studentId, setStudentId] = useState(null);

  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  // prevent opening multiple Razorpay instances
  const razorpayOpenRef = useRef(false);

  // Load event details (if not passed)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!event && routeId) {
        setLoadingEvent(true);
        try {
          const e = await getEventById(routeId);
          if (!mounted) return;
          setEventData({
            id: e._id,
            title: e.title,
            description: e.description || "",
            date: e.date,
            time: e.time,
            venue: e.venue,
            category: e.category,
            capacity: e.capacity,
            registered: e.registrations || 0,
            price: Number(e.price || 0),
            image: e.image || "https://via.placeholder.com/400x400?text=Event+Image",
          });
        } catch (err) {
          console.error("Error loading event:", err);
          addToast("Error loading event details. Please try again later.", { type: "error" });
        } finally {
          if (mounted) setLoadingEvent(false);
        }
      } else if (event) {
        setEventData({
          id: event.id || event._id,
          title: event.title,
          description: event.description || "",
          date: event.date,
          time: event.time,
          venue: event.venue,
          category: event.category,
          capacity: event.capacity,
          registered: event.registrations || event.registered || 0,
          price: Number(event.price || 0),
          image: event.image || "https://via.placeholder.com/400x400?text=Event+Image",
        });
      }
    };
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, event]);

  // Prefill user info (optional) and set studentId
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getMyProfile();
        if (!mounted || !profile) return;
        setStudentId(profile.id || profile._id || profile.userId || null);
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || profile.fullName || profile.name || "",
          email: prev.email || profile.email || "",
          phone: prev.phone || profile.phone || "",
        }));
      } catch (err) {
        // ignore (user might not be logged in)
      }
    })();
    return () => { mounted = false; };
  }, []);

  const currentEvent = eventData;
  if (!currentEvent && loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent && !loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white">Event not found</p>
        </div>
      </div>
    );
  }

  // Derived
  const totalAmount = Number(currentEvent?.price || 0);
  const isPaid = totalAmount > 0;

  // Load Razorpay script once
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleNext = () => {
    if (registrationStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.department) {
        addToast("Please fill all required fields", { type: "error" });
        return;
      }
      if (!formData.agreeTerms) {
        addToast("Please agree to terms", { type: "error" });
        return;
      }
      completeRegistration();
    }
  };

  // Main registration + payment flow
  const completeRegistration = async () => {
    // Prevent double clicks
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Build base payload
      const basePayload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        amount: totalAmount,
      };

      // FREE event: register directly
      if (!isPaid) {
        await registerForEvent(currentEvent.id || currentEvent._id, basePayload);
        setRegistrationStep(3);
        addToast("Registration successful!", { type: "success" });
        setIsProcessing(false);
        return;
      }

      // Paid event: create order
      const orderResp = await createEventPaymentOrder(currentEvent.id || currentEvent._id, studentId, totalAmount);

      // Normalize order object: the backend might return { success, order } or { success, orderId, amount, key }
      const orderObj = orderResp?.order || (orderResp?.orderId ? {
        id: orderResp.orderId,
        amount: orderResp.amount,
        currency: orderResp.currency || "INR",
        key: orderResp.key,
      } : null);

      if (!orderObj) {
        console.error("Invalid order response:", orderResp);
        throw new Error(orderResp?.message || "Failed to create payment order. Try again.");
      }

      // ensure Razorpay script is loaded
      const hasScript = await loadRazorpayScript();
      if (!hasScript) throw new Error("Payment gateway failed to load. Try again later.");

      // get frontend key (use the one returned in orderResp or env as fallback)
      const razorKey = orderResp?.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorKey) {
        throw new Error("Payment key is not configured. Contact admin.");
      }

      // Prevent multiple opens
      if (razorpayOpenRef.current) {
        addToast("Payment already in progress", { type: "info" });
        setIsProcessing(false);
        return;
      }

      razorpayOpenRef.current = true;

      const options = {
        key: razorKey,
        amount: orderObj.amount,
        currency: orderObj.currency || "INR",
        name: currentEvent.title || "Event",
        description: `Registration for ${currentEvent.title}`,
        order_id: orderObj.id,
        prefill: {
          name: basePayload.fullName,
          email: basePayload.email,
          contact: basePayload.phone,
        },
        handler: async function (response) {
          // Response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            // Verify on backend (this should both verify and register in your backend verify endpoint)
            const verifyRes = await verifyEventPayment({
              eventId: currentEvent.id || currentEvent._id,
              studentId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              // you can attach form data too if your backend needs it
              fullName: basePayload.fullName,
              email: basePayload.email,
              phone: basePayload.phone,
              department: basePayload.department,
              year: basePayload.year,
              amount: basePayload.amount,
            });

            if (verifyRes && verifyRes.success) {
              // If backend verify endpoint also returns registration, good.
              setRegistrationStep(3);
              addToast("Payment successful & registration complete!", { type: "success" });
            } else {
              // Fallback: if verify endpoint doesn't create registration, call registerForEvent with payment info
              if (verifyRes && verifyRes.message) {
                console.warn("Verify response:", verifyRes);
              }
              // try fallback register (safe-guard)
              try {
                await registerForEvent(currentEvent.id || currentEvent._id, {
                  ...basePayload,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                });
                setRegistrationStep(3);
                addToast("Payment successful & registration created (fallback).", { type: "success" });
              } catch (fallbackErr) {
                console.error("Fallback registration failed:", fallbackErr);
                addToast("Payment succeeded but registration failed. Contact support.", { type: "error" });
              }
            }
          } catch (err) {
            console.error("Error during payment verification:", err);
            addToast(err?.response?.data?.message || err?.message || "Payment verification failed. Contact support.", { type: "error" });
          } finally {
            razorpayOpenRef.current = false;
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            razorpayOpenRef.current = false;
            setIsProcessing(false);
            addToast("Payment cancelled", { type: "info" });
          },
        },
        theme: { color: "#8B5CF6" },
      };

      const rzp = new window.Razorpay(options);

      // optional: payment.failed handler
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response);
        razorpayOpenRef.current = false;
        setIsProcessing(false);
        addToast("Payment failed. Please try another method.", { type: "error" });
      });

      rzp.open();
    } catch (error) {
      console.error("Registration/Payment error:", error);
      addToast(error?.response?.data?.message || error?.message || "Registration failed. Please try again.", { type: "error" });
      setIsProcessing(false);
      razorpayOpenRef.current = false;
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") return onClose();
    navigate("/student/allevents");
  };

  const isPage = !onClose && (routeId || event);

  // ---------- UI (kept your style; minor tweaks) ----------
  const InnerCard = (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.8;} }
        @keyframes float { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-10px);} }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .delay-100 { animation-delay:0.1s; opacity:0; }
      `}</style>

      {/* Header with Event Banner */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
          <img
            src={currentEvent?.image}
            alt={currentEvent?.title}
            className="w-full h-full object-cover opacity-50"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-lg transition-all duration-300 group"
        >
          <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="inline-block bg-purple-500/30 backdrop-blur-sm text-purple-200 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            {currentEvent?.category}
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">{currentEvent?.title}</h2>
          <div className="flex items-center space-x-4 text-white/80 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(currentEvent?.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{currentEvent?.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-white/80">•</span>
              <span className="text-white/80 text-sm">{isPaid ? `₹${totalAmount}` : "Free"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {registrationStep !== 3 && (
        <div className="bg-white/5 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${registrationStep >= 1 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-white/10 text-white/40"}`}>1</div>
              <span className={`text-sm font-medium ${registrationStep >= 1 ? "text-white" : "text-white/40"}`}>Details</span>
            </div>

            <div className={`flex-1 h-0.5 mx-4 ${registrationStep >= 2 ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/10"}`}></div>

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${registrationStep >= 2 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-white/10 text-white/40"}`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium ${registrationStep >= 2 ? "text-white" : "text-white/40"}`}>Complete</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
        {/* Step 1: Registration Form */}
        {registrationStep === 1 && (
          <div className="space-y-5 animate-slideUp">
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Registration Information</h3>
              <p className="text-white/60 text-sm">Please fill in your details to register for this event</p>
            </div>

            <div className="space-y-4">
              <div className="animate-slideUp delay-100">
                <label className="block text-white/80 text-sm font-medium mb-2">Full Name *</label>
                <input type="text" placeholder="Enter your full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="animate-slideUp delay-200">
                <label className="block text-white/80 text-sm font-medium mb-2">Email Address *</label>
                <input type="email" placeholder="your.email@college.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="animate-slideUp delay-300">
                <label className="block text-white/80 text-sm font-medium mb-2">Phone Number *</label>
                <input type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="animate-slideUp delay-400">
                  <label className="block text-white/80 text-sm font-medium mb-2">Department *</label>
                  <input type="text" placeholder="e.g., Computer Science" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>

                <div className="animate-slideUp delay-400">
                  <label className="block text-white/80 text-sm font-medium mb-2">Year *</label>
                  <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                    <option value="1" className="bg-slate-800">1st Year</option>
                    <option value="2" className="bg-slate-800">2nd Year</option>
                    <option value="3" className="bg-slate-800">3rd Year</option>
                    <option value="4" className="bg-slate-800">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Event Info Summary */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-white/80"><MapPin className="w-4 h-4 text-purple-400" /><span>{currentEvent?.venue}</span></div>
                <div className="flex items-center space-x-2 text-white/80"><Users className="w-4 h-4 text-purple-400" /><span>{currentEvent?.registered}/{currentEvent?.capacity} Registered</span></div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <label className="flex items-start space-x-3 cursor-pointer group p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
              <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })} className="w-5 h-5 mt-0.5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400 transition-all" />
              <span className="text-white/80 text-sm">I agree to the <span className="text-purple-300 hover:text-purple-200 font-semibold underline cursor-pointer">Terms and Conditions</span> and <span className="text-purple-300 hover:text-purple-200 font-semibold underline cursor-pointer">Privacy Policy</span></span>
            </label>

            {/* Submit Button */}
            <button onClick={handleNext} disabled={isProcessing} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              {isProcessing ? (<><Loader className="w-5 h-5 animate-spin" /><span>Processing...</span></>) : (<><span>{isPaid ? `Pay & Register ₹${totalAmount}` : "Complete Registration"}</span><CheckCircle className="w-5 h-5" /></>)}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {registrationStep === 3 && (
          <div className="text-center py-12 animate-scaleIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-float">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>

            <h3 className="text-3xl font-bold text-white mb-3">Registration Successful!</h3>
            <p className="text-white/70 text-lg mb-2">You're all set for {currentEvent?.title}</p>
            <p className="text-white/50 text-sm mb-8">A confirmation email has been sent to {formData.email}</p>

            {/* Success Details */}
            <div className="bg-white/5 rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Event Date</span><span className="text-white font-semibold">{new Date(currentEvent?.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Time</span><span className="text-white font-semibold">{currentEvent?.time}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Venue</span><span className="text-white font-semibold">{currentEvent?.venue}</span></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <button onClick={() => navigate("/student/myevents")} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Ticket className="w-5 h-5" />
                <span>View My Events</span>
              </button>
              <button onClick={handleClose} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition-all">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 py-8">
          <div className="max-w-4xl mx-auto px-4">{InnerCard}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {InnerCard}
    </div>
  );
}

export default EventRegistration;
