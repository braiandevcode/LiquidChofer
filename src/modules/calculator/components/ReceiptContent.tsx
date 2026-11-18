import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { IReceiptData } from '../../../core/interfaces/IReceiptData';
import { VERIFICATION_URL } from '../../../shared/lib/verification';
import VoucherDetailList from './VoucherDetailList';
import type { IReceiptContentProps } from '../interfaces/props/IReceiptContentProps';

const CarSectionReceipt = ({ data }: { data: IReceiptData }): ReactNode => {
  const carPercent: number = data.carPercent ?? 0;
  const carAmount: number = data.carAmount ?? 0;
  const grossCar: number = data.adjustedTotal * (carPercent / 100);
  const totalExpenses: number = data.gas + data.petrol;
  return (
    <>
      <div className="subtle-divider" />
      <div className="flex justify-between p-2 rounded-lg hover:bg-bg-input/50 transition-colors">
        <span className="text-text-secondary">Vehículo ({carPercent}%)</span>
        <span className={`font-semibold font-display ${carAmount >= 0 ? "text-accent-teal" : "text-accent-red"}`}>
          {carAmount >= 0 ? "+" : ""}${carAmount.toLocaleString()}
        </span>
      </div>
      <div className="text-[11px] text-text-muted/90 -mt-1 pl-2 font-mono">
        ${grossCar.toLocaleString()}
        {totalExpenses > 0 && <> - ${totalExpenses.toLocaleString()}</>}
        {" = "}${carAmount.toLocaleString()}
      </div>
    </>
  );
};

const ReceiptContent = ({ data, elementId = 'receipt-content' }: IReceiptContentProps): ReactNode => {
  const hasAgencyDetail: boolean = data.vouchers.length > 0 || data.fuelFromAgency > 0;
  const generatedDate: string = data.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString('es-AR')
    : new Date().toLocaleDateString('es-AR');

  // URL PUBLICA QUE PERMITE COMPROBAR EL CODIGO IMPRESO.
  const verificationUrl: string = data.verificationCode
    ? VERIFICATION_URL(data.verificationCode)
    : '';

  return (
    <div id={elementId} className="receipt-scroll flex-1 overflow-y-auto p-6 min-h-0">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center">
            <span role="img" aria-label="Auto">
              <img src="/logo.png" alt="LiquidChofer" className="h-11 w-11 rounded-xl" />
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-text-primary font-display tracking-tight">
          LiquidChofer
        </h1>
        <p className="text-xs text-text-muted mt-1 font-display">
          {data.subtitle ?? 'Resumen de jornada'}
        </p>
        <div className="subtle-divider mt-4" />
      </div>

      <div className="border border-border-subtle rounded-xl p-4 space-y-3 text-sm bg-bg-card-subtle">
        <div className="flex justify-between items-baseline p-2 rounded-lg bg-bg-input">
          <span className="text-text-secondary font-medium">Ganancia del día</span>
          <span className="text-xl font-black text-text-primary font-display">
            ${data.adjustedTotal.toLocaleString()}
          </span>
        </div>

        <div className="subtle-divider" />

        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display pl-2">
            Distribución
          </span>

          <div>
            <div className="flex justify-between p-2 rounded-lg hover:bg-bg-input/50 transition-colors">
              <span className="text-text-secondary">
                Agencia ({data.agencyPercent}%){" "}
                {hasAgencyDetail ? "+ desc" : ""}
              </span>
              <span className={`font-semibold font-display ${data.finalAgency >= 0 ? "text-accent-amber" : "text-accent-red"}`}>
                ${data.finalAgency.toLocaleString()}
              </span>
            </div>
            {hasAgencyDetail && (
              <span className="text-[11px] text-text-muted/90 font-mono text-right px-2">
                ${data.agencyAmount.toLocaleString()}
                {data.fixedFeeTotal > 0 && <> - ${data.fixedFeeTotal.toLocaleString()}</>}
                {data.otherTotal > 0 && <> - ${data.otherTotal.toLocaleString()}</>}
                {data.fuelFromAgency > 0 && <> - ${data.fuelFromAgency.toLocaleString()} gastos</>}
              </span>
            )}
          </div>

          <div>
            <div className="flex justify-between p-2 rounded-lg hover:bg-bg-input/50 transition-colors">
              <span className="text-text-secondary">
                Conductor ({data.driverPercent}%){" "}
                {data.fuelFromDriver > 0 ? "+ desc" : ""}
              </span>
              <span className={`font-semibold font-display ${data.driverAmount >= 0 ? "text-accent-teal" : "text-accent-red"}`}>
                {data.driverAmount >= 0 ? "+" : ""}${data.driverAmount.toLocaleString()}
              </span>
            </div>
            {data.fuelFromDriver > 0 && (
              <span className="text-[11px] text-text-muted/90 font-mono text-right px-2">
                ${(data.driverAmount + data.fuelFromDriver).toLocaleString()} - ${data.fuelFromDriver.toLocaleString()} gastos
              </span>
            )}
          </div>
        </div>

        {(data.gas > 0 || data.petrol > 0) && (
          <>
            <div className="subtle-divider" />
            <div className="space-y-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display pl-2">
                Gastos
              </span>
              {data.gas > 0 && (
                <div className="flex justify-between p-2 rounded-lg hover:bg-bg-input/50 transition-colors">
                  <span className="text-text-secondary">Gas</span>
                  <span className="font-semibold text-accent-red font-display">
                    -${data.gas.toLocaleString()}
                  </span>
                </div>
              )}
              {data.petrol > 0 && (
                <div className="flex justify-between p-2 rounded-lg hover:bg-bg-input/50 transition-colors">
                  <span className="text-text-secondary">Nafta</span>
                  <span className="font-semibold text-accent-red font-display">
                    -${data.petrol.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {data.carRented && data.carAmount !== null && <CarSectionReceipt data={data} />}

        {data.vouchers.length > 0 && (
          <>
            <div className="subtle-divider" />
            <div className="space-y-2">
              <div className="flex justify-between px-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider font-display">Vales</span>
              </div>
              <div className="mt-1 pl-2">
                <VoucherDetailList voucherDetails={data.vouchers} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 text-center text-xs text-text-muted font-display">
        <p>Generado por LiquidChofer &mdash; {generatedDate}</p>
        {data.verificationCode && (
          <div className="receipt-verification mt-2 rounded-lg border border-border-subtle bg-bg-input/60 px-3 py-2">
            <p className="receipt-verification__label text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              CÓDIGO DE VERIFICACIÓN
            </p>
            <p className="receipt-verification__code mt-0.5 select-all font-mono text-sm font-bold tracking-wider text-text-primary">
              {data.verificationCode}
            </p>
            <a
              data-export-hide
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 rounded text-[11px] font-semibold text-accent-teal underline decoration-accent-teal/40 underline-offset-2 transition-colors cursor-pointer hover:text-accent-teal-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50"
            >
              Verificar recibo
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <div
              data-export-only
              className="receipt-verification__export mt-2 hidden items-center gap-3 text-left"
            >
              <QRCodeSVG
                value={verificationUrl}
                size={56}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
                role="img"
                aria-label="QR para verificar el recibo"
              />
              <div>
                <p className="text-[11px] font-semibold leading-snug">
                  Comprobá que es auténtico
                </p>
                <p className="mt-0.5 break-all font-mono text-[10px] leading-snug">
                  en {verificationUrl}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptContent;
