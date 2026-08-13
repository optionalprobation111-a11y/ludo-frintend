import { useState } from 'react'

const STATUS_STYLES = {
  idle: 'text-muted',
  sending: 'text-brass',
  waiting: 'text-brass',
  joined: 'text-token-green'
}

const STATUS_LABEL = {
  idle: 'Not invited yet',
  sending: 'Sending…',
  waiting: 'Waiting…',
  joined: 'Joined ✅'
}

export default function InviteRow({ index, onInvite, status = 'idle' }) {
  const [phone, setPhone] = useState('')

  const handleInvite = () => {
    if (!phone.trim() || status === 'waiting' || status === 'joined') return
    onInvite?.(phone.trim())
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-hairline bg-raised/60 p-3 animate-rise-in">
      <span className="font-mono text-sm text-muted">{String(index).padStart(2, '0')}</span>
      <input
        type="tel"
        inputMode="tel"
        placeholder="Friend's mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={status === 'waiting' || status === 'joined'}
        className="min-w-0 flex-1 rounded-lg border border-hairline bg-ink px-3 py-2 text-sm
          text-cream placeholder:text-muted/70 outline-none focus:border-brass/60 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={handleInvite}
        disabled={!phone.trim() || status === 'waiting' || status === 'joined' || status === 'sending'}
        className="shrink-0 rounded-lg bg-brass px-4 py-2 text-sm font-semibold text-ink
          transition-colors hover:bg-brass-bright disabled:opacity-40 disabled:pointer-events-none"
      >
        Invite
      </button>
      <span className={`w-24 shrink-0 text-right text-xs font-medium ${STATUS_STYLES[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    </div>
  )
}
