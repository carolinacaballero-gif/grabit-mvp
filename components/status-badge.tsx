import {
  QUOTE_STATUS_CONFIG,
  PO_STATUS_CONFIG,
  ORDER_STATUS_CONFIG,
  ORDER_PRODUCT_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  THREAD_STATUS_CONFIG,
} from '@/lib/constants'

type BadgeVariant =
  | { type: 'quote';         status: keyof typeof QUOTE_STATUS_CONFIG }
  | { type: 'po';            status: keyof typeof PO_STATUS_CONFIG }
  | { type: 'order';         status: keyof typeof ORDER_STATUS_CONFIG }
  | { type: 'order_product'; status: keyof typeof ORDER_PRODUCT_STATUS_CONFIG }
  | { type: 'invoice';       status: keyof typeof INVOICE_STATUS_CONFIG }
  | { type: 'thread';        status: keyof typeof THREAD_STATUS_CONFIG }

export function StatusBadge(props: BadgeVariant) {
  let label = ''
  let badge = ''
  let emoji = ''

  if (props.type === 'quote') {
    const cfg = QUOTE_STATUS_CONFIG[props.status]
    label = cfg.label; badge = cfg.badge
  } else if (props.type === 'po') {
    const cfg = PO_STATUS_CONFIG[props.status]
    label = cfg.label; badge = cfg.badge
  } else if (props.type === 'order') {
    const cfg = ORDER_STATUS_CONFIG[props.status]
    label = cfg.label; badge = cfg.badge; emoji = cfg.emoji
  } else if (props.type === 'order_product') {
    const cfg = ORDER_PRODUCT_STATUS_CONFIG[props.status]
    label = cfg.label; badge = cfg.badge
  } else if (props.type === 'invoice') {
    const cfg = INVOICE_STATUS_CONFIG[props.status]
    label = cfg.label; badge = cfg.badge
  } else if (props.type === 'thread') {
    const cfg = THREAD_STATUS_CONFIG[props.status]
    label = cfg.label; badge = cfg.badge
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge}`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  )
}
