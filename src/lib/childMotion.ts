import childDown from '@/assets/child-motion/child-down.svg'
import childDownLeft from '@/assets/child-motion/child-down-left.svg'
import childDownRight from '@/assets/child-motion/child-down-right.svg'
import childStationary from '@/assets/child-motion/child-stationary.svg'
import childUp from '@/assets/child-motion/child-up.svg'
import childUpLeft from '@/assets/child-motion/child-up-left.svg'
import childUpRight from '@/assets/child-motion/child-up-right.svg'

export function childMotionImage(
  heading: number | null,
  moving: boolean,
) {
  if (!moving || heading === null) return childStationary

  const normalized = (heading + 360) % 360
  if (normalized < 22.5 || normalized >= 337.5) return childUp
  if (normalized < 90) return childUpRight
  if (normalized < 157.5) return childDownRight
  if (normalized < 202.5) return childDown
  if (normalized < 270) return childDownLeft
  return childUpLeft
}
