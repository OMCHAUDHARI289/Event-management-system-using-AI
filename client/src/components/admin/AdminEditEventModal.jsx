import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateEvent } from "../../services/adminService";

export default function AdminEditEventModal({ isOpen, onClose, event, onUpdated }) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    price: "",
    capacity: "",
    status: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        date: event.date ? event.date.split("T")[0] : "",
        time: event.time || "",
        venue: event.venue || "",
        price: event.price || "",
        capacity: event.capacity || "",
        status: event.status || "upcoming",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updated = await updateEvent(event._id, formData);
      onUpdated(updated);
      onClose();
    } catch (err) {
      console.error("Error updating event:", err);
      alert(err.response?.data?.message || "Error updating event");
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-slate-900 text-white rounded-xl p-6 w-96 relative animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:text-red-400"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Event</h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          />
          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="bg-slate-800 p-2 rounded"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 rounded p-2 mt-3"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
