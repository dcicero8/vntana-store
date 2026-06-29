import { useState, useCallback } from 'react'
import { Tldraw, createShapeId, useEditor, track, toRichText } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import * as XLSX from 'xlsx'
import './App.css'
import './sidebar.css'

// ─── Export logic ─────────────────────────────────────────────────────────────
function exportToExcel(editor, settings) {
  const { showroomName, bgColor, textColor, divColor, ppr, imgStyle } = settings
  if (!showroomName) { alert('Set a showroom name first.'); return }

  const shapes = editor.getCurrentPageShapes()
  const frames = shapes.filter(s => s.type === 'frame')
  const notes  = shapes.filter(s => s.type === 'note')

  const parsedAssets = notes.map((n, i) => {
    const util = editor.getShapeUtil(n)
    const text = (util.getText ? util.getText(n) : null) ?? ''
    const uuidMatch = text.match(/uuid[:\s]+([0-9a-f-]{36})/i)
    const nameMatch = text.match(/name[:\s]+(.+)/i)
    return {
      uuid: uuidMatch ? uuidMatch[1].trim() : '',
      name: nameMatch ? nameMatch[1].trim() : '',
      parentId: n.parentId,
      x: n.x, y: n.y,
    }
  }).filter(a => /^[0-9a-f-]{36}$/i.test(a.uuid))

  if (parsedAssets.length === 0) {
    alert('No valid UUIDs found.\n\nMake sure each note contains:\nuuid: <your-uuid-here>\nname: Product Name')
    return
  }

  const groups = frames.map((f, i) => ({
    id: f.id,
    title: f.props.name || `Group ${i + 1}`,
  }))

  const assets = parsedAssets.map((a, i) => {
    const group = groups.find(g => g.id === a.parentId)
    return { uuid: a.uuid, name: a.name, group: group?.title || '', order: i + 1 }
  })

  const wb = XLSX.utils.book_new()

  const wsA = XLSX.utils.aoa_to_sheet([
    ['Asset UUID','Asset Name','Group','Order'],
    ...assets.map(a => [a.uuid, a.name, a.group, a.order])
  ])
  wsA['!cols'] = [{wch:38},{wch:28},{wch:20},{wch:8}]
  XLSX.utils.book_append_sheet(wb, wsA, 'Assets')

  const wsG = XLSX.utils.aoa_to_sheet([
    ['Group Title','Divider Top','Divider Bottom','Visible'],
    ...groups.map(g => [g.title,'No','No','Yes'])
  ])
  XLSX.utils.book_append_sheet(wb, wsG, 'Groups')

  const wsS = XLSX.utils.aoa_to_sheet([
    ['Field','Value'],
    ['Showroom Name', showroomName],
    ['Background Color', bgColor],
    ['Text Color', textColor],
    ['Divider Color', divColor],
    ['Products Per Row', parseInt(ppr)],
    ['Image Style', imgStyle],
  ])
  wsS['!cols'] = [{wch:20},{wch:24}]
  XLSX.utils.book_append_sheet(wb, wsS, 'Styling')

  XLSX.writeFile(wb, `VNTANA Showroom — ${showroomName}.xlsx`)
}

// ─── Sidebar (reads live editor state) ───────────────────────────────────────
const Sidebar = track(function Sidebar({ onExport }) {
  const editor = useEditor()
  const [name, setName]         = useState('New Showroom')
  const [bgColor, setBg]        = useState('#f3f3f3')
  const [textColor, setText]    = useState('#000000')
  const [divColor, setDiv]      = useState('#409c4b')
  const [ppr, setPpr]           = useState('3')
  const [imgStyle, setImgStyle] = useState('CONTAIN')

  const settings = { showroomName: name, bgColor, textColor, divColor, ppr, imgStyle }

  function addGroup() {
    const id = createShapeId()
    editor.createShape({
      id, type: 'frame',
      x: 80 + Math.random() * 120, y: 60 + Math.random() * 80,
      props: { w: 500, h: 300, name: 'Group Name' },
    })
    editor.select(id)
  }

  function addAsset() {
    const id = createShapeId()
    const selected = editor.getSelectedShapes().find(s => s.type === 'frame')
    editor.createShape({
      id, type: 'note',
      parentId: selected?.id,
      x: selected ? 20 + Math.random() * 100 : 200 + Math.random() * 200,
      y: selected ? 40 + Math.random() * 80  : 200 + Math.random() * 200,
      props: {
        richText: toRichText('uuid: paste-uuid-here\nname: Asset Name'),
        color: 'green', size: 's',
      },
    })
    editor.select(id)
  }

  const frameCount = editor.getCurrentPageShapes().filter(s => s.type === 'frame').length
  const noteCount  = editor.getCurrentPageShapes().filter(s => s.type === 'note').length

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <strong>Showroom Canvas</strong>
        <span className="vbadge">VNTANA</span>
      </div>

      <div className="field">
        <label>Showroom Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 007e Series" />
      </div>

      <div className="field">
        <label>Colors</label>
        <div className="color-row">
          <label className="color-item"><span>BG</span><input type="color" value={bgColor} onChange={e => setBg(e.target.value)} /></label>
          <label className="color-item"><span>Text</span><input type="color" value={textColor} onChange={e => setText(e.target.value)} /></label>
          <label className="color-item"><span>Divider</span><input type="color" value={divColor} onChange={e => setDiv(e.target.value)} /></label>
        </div>
      </div>

      <div className="field">
        <label>Layout</label>
        <div className="row-2">
          <select value={ppr} onChange={e => setPpr(e.target.value)}>
            {[2,3,4,5].map(n => <option key={n} value={String(n)}>{n} per row</option>)}
          </select>
          <select value={imgStyle} onChange={e => setImgStyle(e.target.value)}>
            <option value="CONTAIN">Contain</option>
            <option value="COVER">Cover</option>
            <option value="FILL">Fill</option>
          </select>
        </div>
      </div>

      <div className="btn-group">
        <button className="btn-green" onClick={addGroup}>+ Add Group</button>
        <button className="btn-outline" onClick={addAsset}>+ Add Asset</button>
      </div>

      <div className="stats">
        <div className="stat"><span>{frameCount}</span>Groups</div>
        <div className="stat"><span>{noteCount}</span>Assets</div>
      </div>

      <div className="tip">
        <p><strong>How to use:</strong></p>
        <ol>
          <li>Click <strong>+ Add Group</strong> to create a section frame</li>
          <li>Double-click the frame label to rename it</li>
          <li>Select a frame, then click <strong>+ Add Asset</strong></li>
          <li>Double-click each note and replace the uuid &amp; name</li>
          <li>Drag notes between frames to reassign groups</li>
        </ol>
      </div>

      <button className="btn-export" onClick={() => exportToExcel(editor, settings)}>
        ⬇ Export Excel
      </button>
    </div>
  )
})

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false)

  const handleMount = useCallback((editor) => {
    const GROUPS = [
      {
        name: 'Athletics', x: 40, y: 40,
        assets: [
          { name: 'Yoga Top & Leggings', uuid: '' },
        ],
      },
      {
        name: 'Accessories', x: 620, y: 40,
        assets: [
          { name: 'purse_new.glb', uuid: '' },
        ],
      },
      {
        name: 'Jackets', x: 40, y: 420,
        assets: [
          { name: 'VNTANA Jacket (White)', uuid: '' },
          { name: 'VNTANA Jacket (Blue)',  uuid: '' },
          { name: 'VNTANA Jacket (Black)', uuid: '' },
        ],
      },
    ]

    const shapes = []
    GROUPS.forEach(g => {
      const frameId = createShapeId()
      const noteH = 90, notePad = 12
      const frameH = Math.max(260, g.assets.length * (noteH + notePad) + 60)
      shapes.push({
        id: frameId, type: 'frame',
        x: g.x, y: g.y,
        props: { w: 520, h: frameH, name: g.name },
      })
      g.assets.forEach((a, i) => {
        shapes.push({
          id: createShapeId(), type: 'note',
          parentId: frameId,
          x: 20, y: 40 + i * (noteH + notePad),
          props: {
            richText: toRichText(`uuid: ${a.uuid || 'PASTE-UUID-HERE'}\nname: ${a.name}`),
            color: a.uuid ? 'green' : 'yellow',
            size: 's',
          },
        })
      })
    })

    editor.createShapes(shapes)
    editor.zoomToFit()
    setReady(true)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Tldraw onMount={handleMount} />
      </div>
      <div style={{ width: 256, flexShrink: 0, height: '100vh', overflowY: 'auto', background: '#fff', borderLeft: '1px solid #e2e4e9', zIndex: 10 }}>
        {ready && <Sidebar />}
      </div>
    </div>
  )
}
