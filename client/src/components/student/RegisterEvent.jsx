import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Tag, DollarSign, CheckCircle, X, CreditCard, Ticket, AlertCircle, Loader } from "lucide-react";
import { registerForEvent, getEventById, getMyProfile } from "../../services/studentService";

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

  // payment removed: simplified registration flow

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

  const isPaid = false; // payments removed, treat all events as free for registration
  const totalAmount = 0;

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
      completeRegistration();
    }
  };

  // Payment flow removed — simple registration

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
          amount: totalAmount
        };

        const res = await registerForEvent(currentEvent.id || currentEvent._id, payload);

        setRegistrationStep(3);
        setIsProcessing(false);
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
              {"Complete Registration"}
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {/* Payment step removed */}

        {/* Step 3: Success */}
        {registrationStep === 3 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
            <p className="text-white/60">Your registration is confirmed.</p>
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
