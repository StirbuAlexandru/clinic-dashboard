interface StatusBadgeProps{
    status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
    // "self_pay" is shown as "self-pay"
    return <span className={`badge badge-${status}`}>{status.replace('_', '-')}</span>
}

export default StatusBadge
