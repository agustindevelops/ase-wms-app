import QRCode from 'react-native-qrcode-svg';
import { Box } from '@/components/ui/box';

type QrPreviewProps = {
  value: string;
  size?: number;
};

/** Tiny scannable-looking QR thumbnail for location rows and the current level. */
export function QrPreview({ value, size = 32 }: QrPreviewProps) {
  const payload = value.trim();
  if (!payload) {
    return null;
  }

  return (
    <Box className="shrink-0 rounded-md overflow-hidden bg-white">
      <QRCode
        value={payload}
        size={size}
        ecl="M"
        color="#5e5045"
        backgroundColor="#ffffff"
        quietZone={2}
      />
    </Box>
  );
}
