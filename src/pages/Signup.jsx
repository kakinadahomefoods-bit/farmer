import { Link } from 'react-router-dom'

const WHATSAPP_NUMBER = '9709704563'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello HAiFarmer, I would like to create a new account.')}`

export default function Signup() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="heading-font text-2xl font-extrabold text-slate-900">Create Account</h1>
          <p className="mt-2 text-slate-500">Join HAiFarmer for fresh, natural products</p>
        </div>

        <div className="space-y-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-green-600 hover:-translate-y-0.5 transition"
          >
            💬 Chat on WhatsApp to Sign Up
          </a>

          <p className="text-center text-xs text-slate-400 mt-4">For a quick signup, message us on WhatsApp. We'll set up your account instantly!</p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-slate-400">or sign up with email</span></div>
          </div>

          <Link to="/login" className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
            Sign In with Email Instead
          </Link>
        </div>
      </div>
    </div>
  )
}
