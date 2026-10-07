import * as XLSX from 'xlsx';
import { Student } from '../types/discipline';

export interface RawImportStudent {
  stt?: number;
  name: string;
  gender?: 'Nam' | 'Nữ';
  groupId?: number; // 1-6 hoặc undefined
  role?: string;
  isLeader?: boolean;
}

/**
 * Tạo và tải xuống file Excel mẫu chuẩn THCS có sẵn dữ liệu mẫu
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      'STT': 1,
      'Họ và tên': 'Nguyễn Văn An',
      'Giới tính': 'Nam',
      'Nhóm (1-6)': 1,
      'Vai trò': 'Nhóm trưởng',
    },
    {
      'STT': 2,
      'Họ và tên': 'Trần Bảo Anh',
      'Giới tính': 'Nữ',
      'Nhóm (1-6)': 1,
      'Vai trò': 'Cờ đỏ',
    },
    {
      'STT': 3,
      'Họ và tên': 'Lê Minh Châu',
      'Giới tính': 'Nam',
      'Nhóm (1-6)': 1,
      'Vai trò': 'Học sinh',
    },
    {
      'STT': 4,
      'Họ và tên': 'Phạm Đức Dũng',
      'Giới tính': 'Nam',
      'Nhóm (1-6)': 2,
      'Vai trò': 'Nhóm trưởng',
    },
    {
      'STT': 5,
      'Họ và tên': 'Hoàng Thị Giang',
      'Giới tính': 'Nữ',
      'Nhóm (1-6)': 2,
      'Vai trò': 'Học sinh',
    },
    {
      'STT': 6,
      'Họ và tên': 'Vũ Quốc Huy',
      'Giới tính': 'Nam',
      'Nhóm (1-6)': 3,
      'Vai trò': 'Nhóm trưởng',
    },
    {
      'STT': 7,
      'Họ và tên': 'Trần Gia Hưng',
      'Giới tính': 'Nam',
      'Nhóm (1-6)': '', // Để trống để phần mềm tự động chia
      'Vai trò': 'Lớp trưởng',
    },
    {
      'STT': 8,
      'Họ và tên': 'Lê Hoàng Yến Nhi',
      'Giới tính': 'Nữ',
      'Nhóm (1-6)': '',
      'Vai trò': 'Lớp phó',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Chỉnh độ rộng các cột cho đẹp mắt
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 25 }, // Họ và tên
    { wch: 12 }, // Giới tính
    { wch: 15 }, // Nhóm (1-6)
    { wch: 18 }, // Vai trò
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');

  // Hướng dẫn sử dụng ở Sheet 2
  const guideData = [
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '1. Cột "Họ và tên": Bắt buộc phải có tên học sinh.' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '2. Cột "Giới tính": Nhập "Nam" hoặc "Nữ" để hệ thống chia cân bằng nam/nữ nếu cần.' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '3. Cột "Nhóm (1-6)":' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '   - Nếu đã có phân nhóm sẵn: Điền số từ 1 đến 6.' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '   - Nếu chưa có: Để trống, phần mềm có nút "Tự động chia 6 nhóm" (chia đều hoặc cân bằng giới tính).' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '4. Cột "Vai trò": Điền "Nhóm trưởng", "Lớp trưởng", "Lớp phó", "Cờ đỏ", hoặc để trống.' },
    { 'HƯỚNG DẪN SỬ DỤNG FILE MẪU CHÈN DANH SÁCH LỚP': '5. Có thể nhập danh sách từ 30 đến 50 học sinh tùy sĩ số thực tế của lớp.' },
  ];
  const guideSheet = XLSX.utils.json_to_sheet(guideData);
  guideSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, guideSheet, 'Hướng dẫn');

  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Lop_THCS.xlsx');
}

/**
 * Đọc file Excel (.xlsx, .xls) hoặc .csv tải lên từ máy tính
 */
export async function parseExcelOrCsvFile(file: File): Promise<RawImportStudent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Chuyển sang JSON 2D array
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          resolve([]);
          return;
        }

        // Tìm hàng tiêu đề (hàng chứa chữ "Họ", "Tên", "STT", "Name"...)
        let headerRowIdx = -1;
        let colMap: {
          stt?: number;
          name?: number;
          gender?: number;
          group?: number;
          role?: number;
        } = {};

        for (let r = 0; r < Math.min(10, rawJson.length); r++) {
          const row = rawJson[r];
          if (!Array.isArray(row)) continue;

          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || '').toLowerCase().trim();
            if (cellVal.includes('họ') || cellVal.includes('tên') || cellVal.includes('name')) {
              colMap.name = c;
              headerRowIdx = r;
            }
            if (cellVal.includes('stt') || cellVal === 'no') {
              colMap.stt = c;
            }
            if (cellVal.includes('giới tính') || cellVal.includes('phái') || cellVal.includes('gender')) {
              colMap.gender = c;
            }
            if (cellVal.includes('nhóm') || cellVal.includes('tổ') || cellVal.includes('group')) {
              colMap.group = c;
            }
            if (cellVal.includes('vai trò') || cellVal.includes('chức vụ') || cellVal.includes('nhiệm vụ') || cellVal.includes('role')) {
              colMap.role = c;
            }
          }

          if (colMap.name !== undefined) {
            break;
          }
        }

        // Nếu không tìm thấy hàng tiêu đề rõ ràng, giả định cột 1 là STT, cột 2 là Họ tên
        if (colMap.name === undefined) {
          colMap = {
            stt: 0,
            name: 1,
            gender: 2,
            group: 3,
            role: 4,
          };
          headerRowIdx = 0;
        }

        const students: RawImportStudent[] = [];
        let autoStt = 1;

        for (let r = headerRowIdx + 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!Array.isArray(row)) continue;

          const rawName = colMap.name !== undefined ? String(row[colMap.name] || '').trim() : '';
          // Bỏ qua hàng trống hoặc tiêu đề lặp lại
          if (!rawName || rawName.toLowerCase() === 'họ và tên' || rawName.toLowerCase() === 'tên') {
            continue;
          }

          const rawStt = colMap.stt !== undefined && row[colMap.stt] ? Number(row[colMap.stt]) : autoStt;
          const rawGenderStr = colMap.gender !== undefined ? String(row[colMap.gender] || '').trim().toLowerCase() : '';
          const gender: 'Nam' | 'Nữ' =
            rawGenderStr === 'nữ' || rawGenderStr === 'nu' || rawGenderStr === 'female' || rawGenderStr === 'f'
              ? 'Nữ'
              : 'Nam';

          let parsedGroup: number | undefined = undefined;
          if (colMap.group !== undefined && row[colMap.group] !== undefined) {
            const gNum = parseInt(String(row[colMap.group]).replace(/\D/g, ''), 10);
            if (!isNaN(gNum) && gNum >= 1 && gNum <= 6) {
              parsedGroup = gNum;
            }
          }

          const roleStr = colMap.role !== undefined ? String(row[colMap.role] || '').trim() : '';
          const isLeader = roleStr.toLowerCase().includes('nhóm trưởng') || roleStr.toLowerCase().includes('tổ trưởng');

          students.push({
            stt: rawStt || autoStt,
            name: rawName,
            gender,
            groupId: parsedGroup,
            role: roleStr || 'Học sinh',
            isLeader,
          });

          autoStt++;
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Xử lý dữ liệu dán trực tiếp từ Clipboard (Copy từ Word / Excel / Zalo)
 */
export function parsePastedStudentText(text: string): RawImportStudent[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const students: RawImportStudent[] = [];

  let autoStt = 1;

  for (const line of lines) {
    // Thử tách theo tab (khi copy từ Excel) hoặc dấu phẩy / chấm phẩy
    let parts = line.split('\t');
    if (parts.length === 1) {
      parts = line.split(/[,;]/);
    }

    if (parts.length >= 2) {
      // Dạng: STT | Họ tên | Giới tính | Nhóm
      const part1 = parts[0].trim();
      const isPart1Stt = /^\d+$/.test(part1);

      let name = isPart1Stt ? parts[1].trim() : part1;
      let genderStr = isPart1Stt ? (parts[2] || '').trim().toLowerCase() : (parts[1] || '').trim().toLowerCase();
      let groupStr = isPart1Stt ? (parts[3] || '').trim() : (parts[2] || '').trim();

      // Kiểm tra nếu name bị dính số STT ở đầu (VD: "1. Nguyễn Văn A")
      name = name.replace(/^\d+[\.\,\s\-]+/, '').trim();

      if (!name) continue;

      const gender: 'Nam' | 'Nữ' =
        genderStr.includes('nữ') || genderStr.includes('nu') || genderStr.includes('f') ? 'Nữ' : 'Nam';

      let groupId: number | undefined = undefined;
      const gNum = parseInt(groupStr.replace(/\D/g, ''), 10);
      if (!isNaN(gNum) && gNum >= 1 && gNum <= 6) {
        groupId = gNum;
      }

      students.push({
        stt: autoStt,
        name,
        gender,
        groupId,
        role: 'Học sinh',
      });
      autoStt++;
    } else {
      // Chỉ có 1 cột tên duy nhất
      let name = line.replace(/^\d+[\.\,\s\-]+/, '').trim();
      if (!name) continue;

      // Đoán giới tính qua tên lót phổ biến nếu muốn hoặc mặc định Nam
      const lower = name.toLowerCase();
      const isFemale = lower.includes(' thị ') || lower.includes(' thi ') || lower.includes(' ngọc ') || lower.includes(' thảo ') || lower.includes(' như ');

      students.push({
        stt: autoStt,
        name,
        gender: isFemale ? 'Nữ' : 'Nam',
        role: 'Học sinh',
      });
      autoStt++;
    }
  }

  return students;
}

/**
 * Các thuật toán phân chia 6 nhóm:
 */
export type GroupAllocationStrategy =
  | 'keepExisting' // Giữ nguyên nhóm từ file nếu có, ai chưa có thì chia đều
  | 'sequential'   // Chia tuần tự: Nhóm 1 (1-6), Nhóm 2 (7-12)...
  | 'roundRobin'   // Chia vòng tròn: 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6...
  | 'genderBalanced' // Cân bằng tỉ lệ Nam và Nữ giữa 6 nhóm
  | 'random';      // Chia ngẫu nhiên

export function allocateStudentsTo6Groups(
  rawList: RawImportStudent[],
  strategy: GroupAllocationStrategy
): Student[] {
  const result: Student[] = [];

  if (strategy === 'keepExisting') {
    // Ai đã có nhóm 1-6 thì giữ nguyên, ai chưa có thì chia theo round-robin vào các nhóm có sĩ số thấp nhất
    const groupCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    rawList.forEach((s) => {
      if (s.groupId && s.groupId >= 1 && s.groupId <= 6) {
        groupCounts[s.groupId]++;
      }
    });

    const unassigned = rawList.filter((s) => !s.groupId || s.groupId < 1 || s.groupId > 6);
    unassigned.forEach((s) => {
      // Tìm nhóm có ít người nhất
      let minGroup = 1;
      let minVal = groupCounts[1];
      for (let g = 2; g <= 6; g++) {
        if (groupCounts[g] < minVal) {
          minVal = groupCounts[g];
          minGroup = g;
        }
      }
      s.groupId = minGroup;
      groupCounts[minGroup]++;
    });

    rawList.forEach((s, idx) => {
      result.push({
        id: `hs-imp-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        name: s.name,
        gender: s.gender || 'Nam',
        groupId: s.groupId || 1,
        role: s.role || 'Học sinh',
        isLeader: s.isLeader || false,
      });
    });
  } else if (strategy === 'genderBalanced') {
    // Tách riêng danh sách Nam và Nữ
    const males = rawList.filter((s) => s.gender === 'Nam');
    const females = rawList.filter((s) => s.gender !== 'Nam');

    // Chia đều Nam vào 6 nhóm theo round-robin
    males.forEach((s, idx) => {
      s.groupId = (idx % 6) + 1;
    });

    // Chia đều Nữ vào 6 nhóm theo round-robin (đảo ngược thứ tự 6->1 để cân bằng tổng số)
    females.forEach((s, idx) => {
      s.groupId = 6 - (idx % 6);
    });

    const combined = [...males, ...females];
    // Sắp xếp lại theo nhóm và tên để danh sách ngăn nắp
    combined.sort((a, b) => (a.groupId || 1) - (b.groupId || 1));

    combined.forEach((s, idx) => {
      result.push({
        id: `hs-imp-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        name: s.name,
        gender: s.gender || 'Nam',
        groupId: s.groupId || 1,
        role: s.role || 'Học sinh',
        isLeader: s.isLeader || false,
      });
    });
  } else if (strategy === 'roundRobin') {
    // Chia vòng tròn: 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6
    rawList.forEach((s, idx) => {
      const g = (idx % 6) + 1;
      result.push({
        id: `hs-imp-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        name: s.name,
        gender: s.gender || 'Nam',
        groupId: g,
        role: s.role || 'Học sinh',
        isLeader: s.isLeader || false,
      });
    });
  } else if (strategy === 'random') {
    // Xáo trộn ngẫu nhiên
    const shuffled = [...rawList].sort(() => Math.random() - 0.5);
    shuffled.forEach((s, idx) => {
      const g = (idx % 6) + 1;
      result.push({
        id: `hs-imp-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        name: s.name,
        gender: s.gender || 'Nam',
        groupId: g,
        role: s.role || 'Học sinh',
        isLeader: s.isLeader || false,
      });
    });
  } else {
    // 'sequential' Chia theo khối thứ tự
    const perGroup = Math.ceil(rawList.length / 6);
    rawList.forEach((s, idx) => {
      const g = Math.min(6, Math.floor(idx / perGroup) + 1);
      result.push({
        id: `hs-imp-${Date.now()}-${idx + 1}`,
        stt: idx + 1,
        name: s.name,
        gender: s.gender || 'Nam',
        groupId: g,
        role: s.role || 'Học sinh',
        isLeader: s.isLeader || false,
      });
    });
  }

  // Đảm bảo mỗi nhóm đều có 1 nhóm trưởng (tránh chọn bạn đang là Lớp trưởng / Lớp phó)
  for (let g = 1; g <= 6; g++) {
    const groupMembers = result.filter((s) => s.groupId === g);
    const hasLeader = groupMembers.some(
      (s) => (s.isLeader || s.role?.toLowerCase().includes('nhóm trưởng') || s.role?.toLowerCase().includes('tổ trưởng')) &&
             s.role !== 'Lớp trưởng' && !s.role?.includes('Lớp phó')
    );
    if (!hasLeader && groupMembers.length > 0) {
      const candidate = groupMembers.find(
        (s) => s.role !== 'Lớp trưởng' && !s.role?.includes('Lớp phó')
      ) || groupMembers[0];
      candidate.isLeader = true;
      candidate.role = `Nhóm trưởng ${g}`;
    }
  }

  // Đánh lại STT từ 1 đến N
  return result.map((s, idx) => ({ ...s, stt: idx + 1 }));
}

/**
 * Xuất danh sách lớp hiện tại ra file Excel để lưu trữ
 */
export function exportCurrentStudentsToExcel(students: Student[], className: string): void {
  const exportData = students.map((s) => ({
    'STT': s.stt,
    'Họ và tên': s.name,
    'Giới tính': s.gender,
    'Nhóm (1-6)': s.groupId,
    'Vai trò': s.role || (s.isLeader ? `Nhóm trưởng ${s.groupId}` : 'Học sinh'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Lớp ${className}`);
  XLSX.writeFile(workbook, `Danh_Sach_Lop_${className}_6_Nhom.xlsx`);
}
