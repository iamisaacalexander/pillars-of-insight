// src/components/Tablet.tsx
import React from 'react'
import Draggable from 'react-draggable'

interface TabletProps {
  children: React.ReactNode
}

const Tablet: React.FC<TabletProps> = ({ children }) => {
  return (
    <Draggable handle=".drag-handle">
      <div className="fixed top-20 right-8 w-72 bg-gray-800 text-white p-4 rounded-2xl shadow-xl z-50">
        {/* drag-handle: only this area moves the tablet */}
        <div className="drag-handle cursor-move text-sm text-gray-400 mb-2">
          ⇲ Drag me
        </div>
        {children}
      </div>
    </Draggable>
  )
}

export default Tablet
