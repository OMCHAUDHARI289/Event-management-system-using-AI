import React, { useState } from 'react';
import { Mail, Type, Send, FileText } from 'lucide-react';
import { sendCustomEmail } from '../../services/authService';

export default function AdminEmailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !content) {
      alert('Please fill all fields');
      return;
    }
    try {
      setIsSending(true);
      await sendCustomEmail({ to, subject, content, isHtml: true });
      alert('Email sent');
      setSubject('');
      setContent('');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send email';
      alert(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" /> Send Email
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">To</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="student@college.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Subject</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Welcome to ICEM Events"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Body (HTML supported)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-white/50" />
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2.5 pl-10 pr-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="<h2>Welcome</h2><p>Your account is ready.</p>"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSend}
              disabled={isSending}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


