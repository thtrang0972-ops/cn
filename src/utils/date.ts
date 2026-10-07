/**
 * Tiện ích định dạng ngày tháng năm chuẩn Việt Nam (DD/MM/YYYY)
 * Khắc phục hoàn toàn tình trạng ngày tháng năm bị ngược (YYYY-MM-DD hoặc MM/DD/YYYY -> DD/MM/YYYY)
 */

export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  
  // Nếu ở dạng YYYY-MM-DD hoặc YYYY/MM/DD (Năm trước - bị ngược theo chuẩn VN)
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(clean)) {
    const parts = clean.split('T')[0].split(/[-/]/);
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Nếu ở dạng có dấu gạch chéo DD/MM/YYYY hoặc MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    const parts = clean.split('/');
    const n1 = parseInt(parts[0], 10);
    const n2 = parseInt(parts[1], 10);
    const year = parts[2];
    
    // Nếu phần thứ 2 > 12 thì chắc chắn dạng MM/DD/YYYY (bị ngược kiểu Mỹ) -> đổi lại thành DD/MM/YYYY
    if (n2 > 12 && n1 <= 12) {
      const day = parts[1].padStart(2, '0');
      const month = parts[0].padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    
    // Đảm bảo đủ 2 chữ số ngày/tháng
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  
  // Nếu parse được qua Date
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const day = parsed.getDate().toString().padStart(2, '0');
    const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return clean;
}

export function formatShortDateVN(dateStr?: string): string {
  if (!dateStr) return '';
  const full = formatDateVN(dateStr);
  const parts = full.split('/');
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return full;
}

export function formatFullTextDateVN(dateStr?: string): string {
  if (!dateStr) return '';
  const full = formatDateVN(dateStr);
  const parts = full.split('/');
  if (parts.length === 3) {
    return `Ngày ${parts[0]} tháng ${parts[1]} năm ${parts[2]}`;
  }
  return full;
}

export function formatWeekDateRangeVN(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return '';
  const start = formatDateVN(startDate);
  const end = formatDateVN(endDate);
  return `${start} - ${end}`;
}

export function formatWeekDateRangeTextVN(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return '';
  const start = formatDateVN(startDate);
  const end = formatDateVN(endDate);
  return `Từ ngày ${start} đến ngày ${end}`;
}

export function formatWeekHeaderBadgeVN(weekName: string, startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return weekName;
  const start = formatDateVN(startDate);
  const end = formatDateVN(endDate);
  // Loại bỏ chữ (Hiện tại) lặp lại nếu có để hiển thị gọn gàng
  const cleanName = weekName.replace(/\s*\([^)]*\)\s*/g, '').trim();
  return `${cleanName} (${start} - ${end})`;
}
