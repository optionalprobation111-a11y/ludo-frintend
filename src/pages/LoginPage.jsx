import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { useUser } from '../context/UserContext.jsx'
import { verifyFirebaseIdToken } from '../services/api'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function LoginPage({ redirectToRoom = false }) {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { login } = useUser()

  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const recaptchaVerifierRef = useRef(null)
  const recaptchaContainerRef = useRef(null)

  const targetAfterAuth = redirectToRoom && roomId ? `/room/${roomId}` : '/play/friends'

  useEffect(() => {
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => {}
      })
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
        recaptchaVerifierRef.current = null
      }
    }
  }, [auth])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    try {
      const appVerifier = recaptchaVerifierRef.current
      if (!appVerifier) throw new Error('reCAPTCHA not ready')
      const confirmation = await signInWithPhoneNumber(auth, phone.trim(), appVerifier)
      setConfirmationResult(confirmation)
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Could not send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6 || !confirmationResult) return
    setLoading(true)
    setError('')
    try {
      const result = await confirmationResult.confirm(otp)
      const idToken = await result.user.getIdToken()
      const { token, isNewUser } = await verifyFirebaseIdToken(idToken)
      login(token)
      if (isNewUser) {
        navigate('/welcome', { state: { redirectTo: targetAfterAuth } })
      } else {
        navigate(targetAfterAuth)
      }
    } catch (err) {
      setError(err.message || 'Incorrect code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="board-backdrop min-h-screen">
      <PageHeader showBack />
      <main className="mx-auto flex max-w-sm flex-col px-6 pt-10 sm:pt-16">
        <h1 className="font-display text-3xl font-semibold text-cream">
          {step === 'phone' ? 'Enter your number' : 'Verify it\u2019s you'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 'phone'
            ? 'We only ask for this to send invites and keep your stats – it\u2019s never shown to anyone else.'
            : `We sent a 6-digit code to ${phone}.`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="mt-8 flex flex-col gap-4 animate-rise-in">
            <input
              type="tel"
              inputMode="tel"
              autoFocus
              placeholder="Mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-hairline bg-raised px-4 py-3.5 text-cream
                placeholder:text-muted/70 outline-none focus:border-brass/60"
            />
            <div ref={recaptchaContainerRef} />
            {error && <p className="text-sm text-token-red">{error}</p>}
            <button type="submit" disabled={loading || !phone.trim()} className="btn-primary">
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-8 flex flex-col gap-4 animate-rise-in">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="rounded-xl border border-hairline bg-raised px-4 py-3.5 text-center
                font-mono text-xl tracking-[0.5em] text-cream outline-none focus:border-brass/60"
            />
            {error && <p className="text-sm text-token-red">{error}</p>}
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary">
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-muted hover:text-cream"
            >
              Use a different number
            </button>
          </form>
        )}
      </main>
    </div>
  )
}