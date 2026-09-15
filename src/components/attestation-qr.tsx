'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Shield } from 'lucide-react';
import { buildVerifyUrl } from '@/lib/verify-url';

// ============================================================================
// AT-P4 : Composant QR code pour vérification publique d'attestation.
// ============================================================================
//
// Responsabilité unique : recevoir un serialNumber, construire l'URL publique
// de vérification, et rendre un QR code.
//
// Le QR ne contient QUE l'URL publique :
//   https://hseacademy.online/verify/HSEA-2026-XXXXXXXX
//
// Ne JAMAIS inclure dans le QR :
//   - données personnelles (nom, email, userId)
//   - score
//   - courseId, enrollmentId
//   - signatureHash
//   - AUTH_SECRET
//
// Le QR est rendu côté client (SVG) — pas de génération PNG/PDF à ce stade.
// ============================================================================

interface AttestationQRProps {
  serialNumber: string;
  size?: number;
}

export default function AttestationQR({ serialNumber, size = 160 }: AttestationQRProps) {
  const url = buildVerifyUrl(serialNumber);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white border-2 border-emerald-200 rounded-xl shadow-sm">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          marginSize={0}
          fgColor="#065f46"
          bgColor="#ffffff"
          imageSettings={{
            src: '/logo.svg',
            height: 28,
            width: 28,
            excavate: true,
          }}
        />
      </div>
      <div className="text-center max-w-xs">
        <p className="text-xs font-medium text-emerald-700 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Vérification officielle
        </p>
        <p className="text-[10px] text-slate-500 mt-1 break-all font-mono">
          {url}
        </p>
      </div>
    </div>
  );
}
