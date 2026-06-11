import { useEffect, useState } from 'react'
import { Page, PageTitle, Card } from '../components/UI'
import { getUitvraagStats } from '../services/api'

const fmtMs = (ms) => ms == null ? '—' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`
const pct = (r) => `${Math.round((r || 0) * 100)}%`

function Stat({ label, value, sub }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 96 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
      <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</span>}
    </Card>
  )
}

function Bar({ value, max, color = 'var(--blue)' }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 6, height: 10, overflow: 'hidden', minWidth: 80 }}>
      <div style={{ width: `${w}%`, height: '100%', background: color, borderRadius: 6 }} />
    </div>
  )
}

export default function Analyse() {
  const [stats, setStats] = useState(null)
  const [fout, setFout] = useState(null)

  useEffect(() => { getUitvraagStats().then(setStats).catch(e => setFout(e.message)) }, [])

  if (fout) return <Page><PageTitle badge="Analyse" title="📈 Analyse & Monitor" />
    <Card style={{ background: 'var(--red-light)', border: '1px solid var(--red)' }}><span style={{ color: 'var(--red)' }}>{fout}</span></Card></Page>
  if (!stats) return <Page><PageTitle badge="Analyse" title="📈 Analyse & Monitor" sub="Cijfers laden…" /></Page>

  const s = stats
  const leeg = s.totaal_uitvragen === 0
  const st = s.antwoord_status
  const totaal = s.totaal_antwoorden || 1
  const segs = [
    { key: 'OK', label: 'Beantwoord', n: st.OK, color: 'var(--green)' },
    { key: 'GEEN_DATA', label: 'Geen data', n: st.GEEN_DATA, color: 'var(--amber)' },
    { key: 'FOUT', label: 'Fout', n: st.FOUT, color: 'var(--red)' },
  ]
  const maxProf = Math.max(1, ...s.per_profiel.map(p => p.antwoorden))
  const maxZa = Math.max(1, ...s.per_zorgaanbieder.map(z => z.antwoorden))

  return (
    <Page>
      <PageTitle badge="Analyse" title="📈 Analyse & Monitor"
        sub="Hoeveel vragen zijn gesteld en beantwoord, wat is de doorlooptijd, en hoe presteren profielen en zorgaanbieders." />

      {leeg ? (
        <Card><span style={{ color: 'var(--text3)' }}>Nog geen uitvragen. Start er een via Opvragen — daarna verschijnen hier de cijfers.</span></Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <Stat label="Uitvragen" value={s.totaal_uitvragen} />
            <Stat label="Antwoorden" value={s.totaal_antwoorden} sub={`${s.antwoord_status.OK} beantwoord`} />
            <Stat label="Response-ratio" value={pct(s.response_ratio)} sub={`${pct(s.geen_data_ratio)} geen data`} />
            <Stat label="Gem. doorlooptijd" value={fmtMs(s.doorlooptijd.gemiddeld_ms)} sub={`max ${fmtMs(s.doorlooptijd.max_ms)}`} />
          </div>

          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 14 }}>Antwoordverdeling</div>
            <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              {segs.filter(x => x.n > 0).map(x => (
                <div key={x.key} title={`${x.label}: ${x.n}`} style={{ width: `${(x.n / totaal) * 100}%`, background: x.color }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {segs.map(x => (
                <span key={x.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text2)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: x.color }} />
                  {x.label}: <b>{x.n}</b> ({pct(x.n / totaal)})
                </span>
              ))}
            </div>
          </Card>

          <Card style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 6px', fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Per uitwisselprofiel</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ textAlign: 'left', color: 'var(--text3)' }}>
                {['Profiel', 'Uitvragen', 'Antwoorden', '', 'Response'].map((h, i) =>
                  <th key={i} style={{ padding: '8px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {s.per_profiel.map(p => (
                  <tr key={p.profiel} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 20px', fontWeight: 600, color: 'var(--text)' }}>{p.profiel}</td>
                    <td style={{ padding: '10px 20px', color: 'var(--text2)' }}>{p.uitvragen}</td>
                    <td style={{ padding: '10px 20px', color: 'var(--text2)' }}>{p.antwoorden}</td>
                    <td style={{ padding: '10px 20px', width: '30%' }}><Bar value={p.antwoorden} max={maxProf} /></td>
                    <td style={{ padding: '10px 20px', fontWeight: 600, color: p.response_ratio >= 0.9 ? 'var(--green)' : 'var(--amber)' }}>{pct(p.response_ratio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 6px', fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Per zorgaanbieder</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ textAlign: 'left', color: 'var(--text3)' }}>
                {['Zorgaanbieder', 'Antwoorden', '', 'Response', 'Gem. tijd'].map((h, i) =>
                  <th key={i} style={{ padding: '8px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {s.per_zorgaanbieder.map(z => (
                  <tr key={z.zorgaanbieder} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 20px', fontWeight: 600, color: 'var(--text)' }}>{z.zorgaanbieder}</td>
                    <td style={{ padding: '10px 20px', color: 'var(--text2)' }}>{z.antwoorden}</td>
                    <td style={{ padding: '10px 20px', width: '25%' }}><Bar value={z.antwoorden} max={maxZa} color="var(--accent)" /></td>
                    <td style={{ padding: '10px 20px', fontWeight: 600, color: z.response_ratio >= 0.9 ? 'var(--green)' : 'var(--amber)' }}>{pct(z.response_ratio)}</td>
                    <td style={{ padding: '10px 20px', color: 'var(--text2)' }}>{fmtMs(z.gem_duur_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </Page>
  )
}
