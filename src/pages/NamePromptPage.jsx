import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { useUser } from '../context/UserContext.jsx'
import { saveProfile } from '../services/api'

export default function NamePromptPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, anonId, setName, clearAnonymousId } = useUser()

  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.redirectTo || '/play/friends'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    setError('')
    try {
      await saveProfile({ token, name: value.trim(), anonId: anonId || undefined })
      setName(value.trim())
      if (anonId) clearAnonymousId()
      navigate(redirectTo)
    } catch (err) {
      setError(err.message || 'Could not save your name. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="board-backdrop min-h-screen">
      <PageHeader />
      <main className="mx-auto flex max-w-sm flex-col px-6 pt-10 sm:pt-16">
        <h1 className="font-display text-3xl font-semibold text-cream">What should we call you?</h1>
        <p className="mt-2 text-sm text-muted">
          This name is what everyone else sees on the board and in invites — your number never is.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 animate-rise-in">
          <input
            type="text"
            autoFocus
            maxLength={24}
            placeholder="Your name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-xl border border-hairline bg-raised px-4 py-3.5 text-cream
              placeholder:text-muted/70 outline-none focus:border-brass/60"
          />
          {error && <p className="text-sm text-token-red">{error}</p>}
          <button type="submit" disabled={loading || !value.trim()} className="btn-primary">
            {loading ? 'Saving…' : 'Continue to the table'}
          </button>
        </form>
      </main>
    </div>
  )
}
