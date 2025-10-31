import api from './api'; // your axios instance

const STUDENT_BASE = 'http://localhost:5000/api/student';
const ADMIN_BASE = 'http://localhost:5000/api/admin';
const AI_BASE = 'http://localhost:5000/api/ai';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Get current logged-in student's profile
export const getMyProfile = async () => {
  const res = await api.get(`${STUDENT_BASE}/me`, getAuthHeaders());
  return res.data; // { id, name, email, role }
};

// Update student profile
export const updateProfile = async (payload) => {
  const res = await api.put(`${STUDENT_BASE}/update-profile`, payload, getAuthHeaders());
  return res.data; // updated profile object
};

// Upload student avatar
export const uploadAvatar = async (file) => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('avatar', file);

  const res = await api.post(
    `${STUDENT_BASE}/me/avatar`,
    formData,
    {
      headers: {
        ...getAuthHeaders().headers,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data; // { success, avatarUrl, user }
};

export const uploadBanner = async (file) => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('banner', file);

  const res = await api.post(`${STUDENT_BASE}/me/banner`, formData, {
    headers: {
      ...(getAuthHeaders().headers || {}),
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data; // { success, bannerUrl, user }
};


// Get a single event (uses admin public endpoint)
export const getEventById = async (id) => {
  const res = await api.get(`${ADMIN_BASE}/events/${id}`);
  return res.data;
};

// Register for an event (student)
export const registerForEvent = async (eventId, payload) => {
  const res = await api.post(`${STUDENT_BASE}/events/${eventId}/register`, payload, getAuthHeaders());
  return res.data; // { message, registrationId, ticketNumber }
};

// Get events for logged-in student
export const getMyEvents = async () => {
  const res = await api.get(`${STUDENT_BASE}/my-events`, getAuthHeaders());
  return res.data; // grouped object { upcoming, ongoing, completed, cancelled }
};

// Get public list of events for students
export const getStudentEvents = async () => {
  const res = await api.get(`${STUDENT_BASE}/events`);
  return res.data; // array of events
};

// Get ticket for a registration/event
export const getTicket = async (eventId) => {
  const res = await api.get(`${STUDENT_BASE}/events/${eventId}/ticket`, getAuthHeaders());
  return res.data;
};

// Submit feedback for a registration
export const submitEventFeedback = async (registrationId, payload) => {
  const res = await api.post(`${STUDENT_BASE}/registrations/${registrationId}/feedback`, payload, getAuthHeaders());
  return res.data; // { message, feedback }
};

// Get leaderboard
// Get leaderboard (normalized for frontend)
export const getLeaderboard = async () => {
  try {
    const res = await api.get(`${STUDENT_BASE}/leaderboard`, getAuthHeaders());
    const data = res.data || {};

    const currentUserId = data?.currentUser?._id || data?.currentUser?.id || null;

    const normalized = (Array.isArray(data.leaderboard) ? data.leaderboard : []).map((entry, idx, arr) => {
      const user = entry.userId || {};
      const name = user.name || 'Unknown';
      const avatar = user.avatar || name.split(' ').map(n => n[0] || '').slice(0, 2).join('').toUpperCase();

      return {
        _id: entry._id || user._id || user.id || null,
        userId: user._id || user.id || null,
        name,
        email: user.email || null,
        phone: user.phone || null,
        studentId: user.studentId || null,
        department: user.department || null,
        role: user.role || 'student',
        clubName: user.clubName || null,
        avatar,
        points: entry.points ?? 0,
        level: entry.level || 'Bronze',
        rank: entry.rank ?? (idx + 1),
        trend: entry.trend || 'same',
        streak: entry.streak ?? 0,
        eventsAttended: entry.eventsAttended ?? entry.totalAttended ?? (entry.stats?.totalAttended ?? 0),
        totalRegistrations: entry.stats?.totalRegistrations ?? 0,
        totalFeedback: entry.stats?.totalFeedback ?? 0,
        achievements: Array.isArray(entry.achievements) ? entry.achievements : [],
        badges: entry.badges ?? 0,
        isCurrentUser: Boolean(currentUserId && (currentUserId.toString() === (user._id || user.id || entry._id)?.toString())),
      };
    });

    // Current user normalized
    const currentUser = data.currentUser ? {
      id: data.currentUser._id || data.currentUser.id || null,
      name: data.currentUser.name || null,
      email: data.currentUser.email || null,
      phone: data.currentUser.phone || null,
      studentId: data.currentUser.studentId || null,
      department: data.currentUser.department || null,
      role: data.currentUser.role || 'student',
      clubName: data.currentUser.clubName || null,
      points: data.currentUser.points ?? 0,
      level: data.currentUser.level || 'Bronze',
      rank: data.currentUser.rank ?? null,
      trend: data.currentUser.trend || 'same',
      streak: data.currentUser.streak ?? 0,
      eventsAttended: data.currentUser.eventsAttended ?? data.currentUser.totalAttended ?? 0,
      totalRegistrations: data.currentUser.totalRegistrations ?? 0,
      totalFeedback: data.currentUser.totalFeedback ?? 0,
      achievements: Array.isArray(data.currentUser.achievements) ? data.currentUser.achievements : [],
      badges: data.currentUser.badges ?? 0,
    } : null;

    return { leaderboard: normalized, currentUser };
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return { leaderboard: [], currentUser: null };
  }
};


// ----------------------
// Certificates
// ----------------------

// Add a certificate
export const addCertificate = async (payload) => {
  const res = await api.post(`${STUDENT_BASE}/certificates`, payload, getAuthHeaders());
  return res.data; // { message, certificate }
};

// Get all certificates for the logged-in student
export const getCertificates = async () => {
  const res = await api.get(`${STUDENT_BASE}/certificates`, getAuthHeaders());
  return res.data; // array of certificates
};

// Create Razorpay order for event registration
export const createEventPaymentOrder = async (eventId, userId, amount) => {
  const res = await api.post(`/api/payment/register-event`, {
    eventId,
    userId,
    amount,
  });
  
  return res.data;
};

// Verify Razorpay payment after success
export const verifyEventPayment = async (paymentData) => {
  const res = await api.post(`/api/payment/verify-registration`, paymentData);
  return res.data;
};
