export default function StatusBadge({ status }) {
  const config = {
    Pending: {
      bg: 'bg-yellow-100/50',
      text: 'text-warning',
      border: 'border-warning/20',
      dot: 'bg-warning',
    },
    'In Progress': {
      bg: 'bg-blue-100/50',
      text: 'text-primary',
      border: 'border-primary/20',
      dot: 'bg-primary',
    },
    Resolved: {
      bg: 'bg-green-100/50',
      text: 'text-success',
      border: 'border-success/20',
      dot: 'bg-success',
    },
    Escalated: {
      bg: 'bg-red-100/50',
      text: 'text-error',
      border: 'border-error/20',
      dot: 'bg-error',
    },
  }

  const style = config[status] || config['Pending']

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status}
    </span>
  )
}
