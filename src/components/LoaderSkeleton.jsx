import { motion } from 'framer-motion'

function SkeletonBox({ className, style }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded-xl ${className}`} style={style}>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-8 w-14" />
          <SkeletonBox className="h-3 w-24" />
        </div>
        <SkeletonBox className="w-12 h-12 rounded-2xl" />
      </div>
    </div>
  )
}

export function ComplaintCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <SkeletonBox className="w-14 h-5 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonBox className="w-20 h-6 rounded-full" />
      </div>
      <SkeletonBox className="h-3.5 w-full mb-2" />
      <SkeletonBox className="h-3.5 w-2/3 mb-5" />
      <div className="flex items-center gap-6">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-24" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50/50">
          {[180, 240, 100, 90, 80].map((w, j) => (
            <td key={j} className="px-4 py-5">
              <SkeletonBox className="h-3 rounded" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function LoaderSkeleton({ type = 'card', count = 3 }) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
    )
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <ComplaintCardSkeleton key={i} />)}
    </div>
  )
}
