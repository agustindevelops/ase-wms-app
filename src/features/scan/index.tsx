import { useScan, type ScannerKind } from './hook/useScan';
import { ScanView } from './ui/ScanView';

export type { ScannerKind };

type Props = {
  kind: ScannerKind;
  onClose: () => void;
};

/** Scan feature container — wires hook handlers into dumb UI. */
export function Scan({ kind, onClose }: Props) {
  const scan = useScan(kind);

  return <ScanView {...scan} onClose={onClose} />;
}

export default Scan;
