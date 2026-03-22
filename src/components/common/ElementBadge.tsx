import { ELEMENT_NAMES, type Element } from '../../types';

export const ELEMENT_COLORS: Record<Element, string> = {
  blaze: '#c05030',
  frost: '#3070a0',
  volt: '#a08820',
  venom: '#408030',
  alloy: '#686868',
  mirage: '#7050a0',
};

export function ElementBadge({ element }: { element: Element }) {
  return (
    <span className={`element-badge ${element}`}>
      {ELEMENT_NAMES[element]}
    </span>
  );
}
