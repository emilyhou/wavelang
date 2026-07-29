import type { Player, RoomState, TeamId } from '../game/types'
import './PlayerList.css'

interface PlayerListProps {
  state: RoomState
  playerId: string
  onlinePlayerIds: string[]
  /** Omitted outside the lobby, where teams are locked. */
  onSetTeam?: (playerId: string, team: TeamId) => void
}

/** Lobby roster. In teams mode each row can be dragged between sides. */
export function PlayerList({ state, playerId, onlinePlayerIds, onSetTeam }: PlayerListProps) {
  const online = new Set(onlinePlayerIds)

  const row = (player: Player) => (
    <li key={player.id} className={online.has(player.id) ? 'player' : 'player away'}>
      <span className="player-dot" aria-hidden="true" />
      <span className="player-name">
        {player.name}
        {player.id === playerId && <span className="muted"> (you)</span>}
        {player.id === state.hostId && <span className="player-host">host</span>}
      </span>
      {onSetTeam && state.mode === 'teams' && (
        <button
          type="button"
          className="ghost player-swap"
          onClick={() => onSetTeam(player.id, player.team === 'left' ? 'right' : 'left')}
        >
          {player.team === 'left' ? '→' : '←'}
        </button>
      )}
    </li>
  )

  if (state.mode === 'coop') {
    return (
      <div className="card stack">
        <h3>Players ({state.players.length})</h3>
        <ul className="player-list">{state.players.map(row)}</ul>
      </div>
    )
  }

  const left = state.players.filter((p) => p.team === 'left')
  const right = state.players.filter((p) => p.team === 'right')

  return (
    <div className="teams">
      <div className="card stack">
        <h3 className="team-left">Left Brain ({left.length})</h3>
        <ul className="player-list">{left.map(row)}</ul>
        {left.length === 0 && <p className="muted">Nobody here yet.</p>}
      </div>
      <div className="card stack">
        <h3 className="team-right">Right Brain ({right.length})</h3>
        <ul className="player-list">{right.map(row)}</ul>
        {right.length === 0 && <p className="muted">Nobody here yet.</p>}
      </div>
    </div>
  )
}
