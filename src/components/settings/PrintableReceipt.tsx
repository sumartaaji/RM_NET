
'use client';

import type { Transaction, StoreSettings, TransactionItem } from '@/types';

interface PrintableReceiptProps {
  transaction: Transaction | null;
  storeSettings: Partial<StoreSettings>;
}

export default function PrintableReceipt({ transaction, storeSettings }: PrintableReceiptProps) {
  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getPaymentMethodDisplay = (transaction: Transaction): string => {
    if (transaction.paymentMethod === 'cash') return 'TUNAI';
    if (transaction.paymentMethod === 'transfer') {
      return transaction.transferOptionName ? transaction.transferOptionName.toUpperCase() : 'TRANSFER';
    }
    return 'TIDAK DIKETAHUI';
  };

  const styles = {
    receiptContainer: {
      fontFamily: 'monospace, sans-serif', 
      width: '300px', 
      padding: '10px',
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#000', 
      margin: '0 auto', 
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '10px',
    },
    storeName: {
      fontSize: '16px',
      fontWeight: 'bold' as const,
    },
    address: {
      fontSize: '10px',
    },
    transactionInfo: {
      marginBottom: '10px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between' as const,
    },
    itemsTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginBottom: '10px',
    },
    th: {
      textAlign: 'left' as const,
      borderBottom: '1px dashed #000',
      padding: '2px 0',
    },
    td: {
      padding: '2px 0',
    },
    tdRight: {
      textAlign: 'right' as const,
    },
    totals: {
      marginTop: '10px',
    },
    totalsRow: {
      display: 'flex',
      justifyContent: 'space-between' as const,
    },
    totalsRowBold: {
      display: 'flex',
      justifyContent: 'space-between' as const,
      fontWeight: 'bold' as const,
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '15px',
      fontSize: '10px',
    },
    hr: {
      border: 'none',
      borderTop: '1px dashed #000',
      margin: '5px 0',
    }
  };

  return (
    <div style={styles.receiptContainer}>
      <div style={styles.header}>
        {storeSettings.storeName && <div style={styles.storeName}>{storeSettings.storeName}</div>}
        {storeSettings.storeAddress && <div style={styles.address}>{storeSettings.storeAddress}</div>}
        {storeSettings.storePhone && <div style={styles.address}>Telp: {storeSettings.storePhone}</div>}
      </div>

      <hr style={styles.hr} />

      <div style={styles.transactionInfo}>
        <div style={styles.infoRow}>
          <span>No: {transaction.transactionNumber}</span>
          <span>Kasir: {storeSettings.userName || 'Admin'}</span>
        </div>
        <div style={styles.infoRow}>
          <span>Tgl: {formatDate(transaction.dateTime)}</span>
        </div>
      </div>

      <hr style={styles.hr} />

      <table style={styles.itemsTable}>
        <thead>
          <tr>
            <th style={styles.th}>Item</th>
            <th style={{ ...styles.th, ...styles.tdRight, width: '20px' }}>Jml</th>
            <th style={{ ...styles.th, ...styles.tdRight }}>Harga</th>
            <th style={{ ...styles.th, ...styles.tdRight }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items.map((item: TransactionItem) => (
            <tr key={item.id}>
              <td style={styles.td}>{item.name}</td>
              <td style={{...styles.td, ...styles.tdRight}}>{item.quantity}</td>
              <td style={{...styles.td, ...styles.tdRight}}>{item.price.toLocaleString('id-ID')}</td>
              <td style={{...styles.td, ...styles.tdRight}}>{(item.price * item.quantity).toLocaleString('id-ID')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={styles.hr} />
      
      <div style={styles.totals}>
        <div style={styles.totalsRow}>
          <span>Subtotal:</span>
          <span>Rp {transaction.subtotal.toLocaleString('id-ID')}</span>
        </div>
        {transaction.taxAmount > 0 && (
          <div style={styles.totalsRow}>
            <span>Pajak ({((transaction.taxAmount / transaction.subtotal) * 100 || 0).toFixed(0)}%):</span>
            <span>Rp {transaction.taxAmount.toLocaleString('id-ID')}</span>
          </div>
        )}
        {transaction.taxAmount === 0 && (
           <div style={styles.totalsRow}>
            <span>Pajak (0%):</span>
            <span>Rp 0</span>
          </div>
        )}
        <hr style={styles.hr} />
        <div style={styles.totalsRowBold}>
          <span>TOTAL:</span>
          <span>Rp {transaction.totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>
      
      {transaction.amountPaid !== undefined && (transaction.paymentMethod === 'cash' || transaction.changeGiven !== undefined) && (
        <>
          <hr style={styles.hr} />
          <div style={styles.totals}>
            <div style={styles.totalsRow}>
              <span>Dibayar ({getPaymentMethodDisplay(transaction)}):</span>
              <span>Rp {transaction.amountPaid.toLocaleString('id-ID')}</span>
            </div>
            {(transaction.changeGiven !== undefined && transaction.changeGiven > 0) && (
              <div style={styles.totalsRow}>
                <span>Kembali:</span>
                <span>Rp {transaction.changeGiven.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </>
      )}


      <div style={styles.footer}>
        TERIMA KASIH ATAS KUNJUNGAN ANDA
      </div>
    </div>
  );
}
