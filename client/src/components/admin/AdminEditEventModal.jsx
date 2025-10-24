import React, { useState, useEffect } from "react";
import { X, Save, Upload, AlertCircle } from "lucide-react";
import { updateEvent } from "../../services/adminService";

export default function AdminEditEventModal({ isOpen, onClose, event, onUpdated }) {
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    price: "",
    status: "upcoming",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");

  // Populate form when event changes
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        image: event.image || "",
        title: event.title || "",
        date: event.date ? event.date.split("T")[0] : "",
        time: event.time || "",
        venue: event.venue || "",
        capacity: event.capacity?.toString() || "",
        price: event.price?.toString() || "",
        status: event.status || "upcoming",
      });
      setImagePreview(event.image || "");
      setErrors({});
    }
  }, [event, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, image: "Please select a valid image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setTimeout(() => handleChange("image", reader.result), 500);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.date) newErrors.date = "Date is required";
    else if (new Date(formData.date) < new Date().setHours(0,0,0,0)) newErrors.date = "Date cannot be in the past";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue is required";
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = "Capacity must be > 0";
    if (formData.price && formData.price < 0) newErrors.price = "Price cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        price: Number(formData.price || 0),
      };
      const updatedEvent = await updateEvent(event._id, payload);
      onUpdated(updatedEvent);
      handleClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err?.response?.data?.message || "Failed to update event" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      image: "",
      title: "",
      date: "",
      time: "",
      venue: "",
      capacity: "",
      price: "",
      status: "upcoming",
    });
    setImagePreview("");
    setErrors({});
    onClose();
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl animate-scaleIn">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <Save className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Edit Event</h2>
          </div>
          <button onClick={handleClose} disabled={loading} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6 space-y-6">
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">Event Image</label>
            {imagePreview && (
              <div className="mb-4">
                <div className="relative w-full h-48 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload"/>
            <label htmlFor="image-upload" className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-3 rounded-xl cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
            </label>
            {errors.image && <p className="text-red-400 text-xs mt-2">{errors.image}</p>}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            <input type="text" placeholder="Title" value={formData.title} onChange={(e)=>handleChange('title', e.target.value)}
              className={`w-full bg-white/10 border ${errors.title ? 'border-red-500/50':'border-white/20'} rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500`} />
            {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}

            <input type="date" value={formData.date} onChange={(e)=>handleChange('date', e.target.value)}
              className={`w-full bg-white/10 border ${errors.date ? 'border-red-500/50':'border-white/20'} rounded-xl px-4 py-3 text-white`} />
            {errors.date && <p className="text-red-400 text-xs">{errors.date}</p>}

            <input type="time" value={formData.time} onChange={(e)=>handleChange('time', e.target.value)}
              className={`w-full bg-white/10 border ${errors.time ? 'border-red-500/50':'border-white/20'} rounded-xl px-4 py-3 text-white`} />
            {errors.time && <p className="text-red-400 text-xs">{errors.time}</p>}

            <input type="text" placeholder="Venue" value={formData.venue} onChange={(e)=>handleChange('venue', e.target.value)}
              className={`w-full bg-white/10 border ${errors.venue ? 'border-red-500/50':'border-white/20'} rounded-xl px-4 py-3 text-white`} />
            {errors.venue && <p className="text-red-400 text-xs">{errors.venue}</p>}

            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Capacity" min="1" value={formData.capacity} onChange={(e)=>handleChange('capacity', e.target.value)}
                className={`w-full bg-white/10 border ${errors.capacity ? 'border-red-500/50':'border-white/20'} rounded-xl px-4 py-3 text-white`} />
              {errors.capacity && <p className="text-red-400 text-xs">{errors.capacity}</p>}

              <input type="number" placeholder="Price" min="0" value={formData.price} onChange={(e)=>handleChange('price', e.target.value)}
                className={`w-full bg-white/10 border ${errors.price ? 'border-red-500/50':'border-white/20'} rounded-xl px-4 py-3 text-white`} />
              {errors.price && <p className="text-red-400 text-xs">{errors.price}</p>}
            </div>

            <select value={formData.status} onChange={(e)=>handleChange('status', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button onClick={handleClose} disabled={loading}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all">Cancel</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center space-x-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
