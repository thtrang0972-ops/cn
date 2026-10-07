import {
  Student,
  StudentWeeklyRecord,
  CalculatedStudentScore,
  GroupSummary,
  ScoreClassification,
} from '../types/discipline';

export interface CriterionMeta {
  key: keyof Omit<StudentWeeklyRecord, 'studentId' | 'note'>;
  code: string;
  name: string;
  points: number; // âm là trừ, dương là cộng
  isBonus: boolean;
  category: 'chuyenCan' | 'hocTap' | 'tacPhong' | 'veSinh' | 'kyLuat' | 'khenThuong';
  categoryLabel: string;
  description: string;
}

export const CRITERIA_LIST: CriterionMeta[] = [
  {
    key: 'diTre',
    code: 'DT',
    name: 'Đi trễ',
    points: -2,
    isBonus: false,
    category: 'chuyenCan',
    categoryLabel: 'Chuyên cần',
    description: 'Đến lớp sau tiếng trống vào học hoặc 15p đầu giờ (-2đ/lần)',
  },
  {
    key: 'nghiCP',
    code: 'NCP',
    name: 'Nghỉ có phép',
    points: -2,
    isBonus: false,
    category: 'chuyenCan',
    categoryLabel: 'Chuyên cần',
    description: 'Nghỉ học có đơn xin phép của phụ huynh (-2đ/buổi)',
  },
  {
    key: 'nghiKP',
    code: 'NKP',
    name: 'Nghỉ không phép',
    points: -4,
    isBonus: false,
    category: 'chuyenCan',
    categoryLabel: 'Chuyên cần',
    description: 'Nghỉ học tự ý không có đơn xin phép (-4đ/buổi)',
  },
  {
    key: 'boTiet',
    code: 'BT',
    name: 'Bỏ tiết',
    points: -2,
    isBonus: false,
    category: 'kyLuat',
    categoryLabel: 'Kỷ luật',
    description: 'Tự ý ra khỏi lớp, trốn tiết học chính khóa hoặc trái buổi (-2đ/tiết)',
  },
  {
    key: 'ktbKlbKsb',
    code: 'KTB',
    name: 'KTB / KLB / KSB',
    points: -2,
    isBonus: false,
    category: 'hocTap',
    categoryLabel: 'Học tập',
    description: 'Không thuộc bài, không làm bài tập, không soạn bài trước giờ (-2đ/lần)',
  },
  {
    key: 'khongDongPhuc2',
    code: 'ĐP',
    name: 'Không đồng phục',
    points: -2,
    isBonus: false,
    category: 'tacPhong',
    categoryLabel: 'Tác phong',
    description: 'Quên khăn quàng đỏ, không đeo phù hiệu, không mặc đúng đồng phục quy định (-2đ/lần)',
  },
  {
    key: 'diemTot',
    code: 'ĐT',
    name: 'Điểm tốt (9-10)',
    points: 2,
    isBonus: true,
    category: 'khenThuong',
    categoryLabel: 'Khen thưởng',
    description: 'Đạt điểm kiểm tra miệng, 15 phút, 1 tiết từ 9 đến 10 điểm (+2đ/con điểm)',
  },
  {
    key: 'phatBieu',
    code: 'PB',
    name: 'Phát biểu',
    points: 1,
    isBonus: true,
    category: 'khenThuong',
    categoryLabel: 'Khen thưởng',
    description: 'Tích cực hăng hái giơ tay phát biểu xây dựng bài trong tiết học (+1đ/lần)',
  },
  {
    key: 'matTratTu',
    code: 'MTT',
    name: 'Mất trật tự',
    points: -2,
    isBonus: false,
    category: 'kyLuat',
    categoryLabel: 'Kỷ luật',
    description: 'Nói chuyện riêng, làm việc riêng, gây ồn ào ảnh hưởng tiết học (-2đ/lần)',
  },
  {
    key: 'khongThamGiaVS',
    code: 'K-VS',
    name: 'Không tham gia VS',
    points: -2,
    isBonus: false,
    category: 'veSinh',
    categoryLabel: 'Vệ sinh',
    description: 'Trốn trực nhật, không quét lớp, không tham gia lao động vệ sinh chung (-2đ/lần)',
  },
  {
    key: 'noiTuc',
    code: 'NT',
    name: 'Nói tục, chửi thề',
    points: -2,
    isBonus: false,
    category: 'kyLuat',
    categoryLabel: 'Kỷ luật',
    description: 'Sử dụng ngôn ngữ thiếu văn hóa, xưng hô thô tục trong trường lớp (-2đ/lần)',
  },
  {
    key: 'xaRac',
    code: 'XR',
    name: 'Xả rác trong lớp',
    points: -2,
    isBonus: false,
    category: 'veSinh',
    categoryLabel: 'Vệ sinh',
    description: 'Vứt rác, vỏ bánh kẹo bừa bãi trong hộc bàn hoặc sàn lớp (-2đ/lần)',
  },
  {
    key: 'trucVSBan',
    code: 'VS-B',
    name: 'Trực VS bẩn',
    points: -2,
    isBonus: false,
    category: 'veSinh',
    categoryLabel: 'Vệ sinh',
    description: 'Tổ/cá nhân trực nhật không sạch, bảng đen bẩn, bàn GV chưa lau (-2đ/lần)',
  },
  {
    key: 'huHongTS',
    code: 'HH-TS',
    name: 'Hư hỏng tài sản',
    points: -5,
    isBonus: false,
    category: 'kyLuat',
    categoryLabel: 'Kỷ luật',
    description: 'Vẽ bậy lên bàn, làm gãy ghế, hỏng quạt đèn hoặc thiết bị lớp (-5đ/lần)',
  },
  {
    key: 'voLeGV',
    code: 'VL-GV',
    name: 'Vô lễ GV',
    points: -5,
    isBonus: false,
    category: 'kyLuat',
    categoryLabel: 'Kỷ luật',
    description: 'Cãi lời, thái độ vô lễ với giáo viên, nhân viên nhà trường (-5đ/lần)',
  },
  {
    key: 'dungDienThoai',
    code: 'ĐT-10',
    name: 'Dùng điện thoại',
    points: -10,
    isBonus: false,
    category: 'kyLuat',
    categoryLabel: 'Kỷ luật',
    description: 'Sử dụng điện thoại di động trong giờ khi chưa được GV cho phép (-10đ/lần)',
  },
];

export const BASE_SCORE = 100;

/**
 * Xếp loại nề nếp theo bảng quy định THCS
 */
export function getClassification(finalScore: number): ScoreClassification {
  if (finalScore >= 90) return 'Tốt';
  if (finalScore >= 80) return 'Khá';
  if (finalScore >= 70) return 'Đạt';
  return 'Chưa đạt';
}

export function getClassificationColor(cls: ScoreClassification): {
  bg: string;
  text: string;
  badge: string;
  border: string;
} {
  switch (cls) {
    case 'Tốt':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        border: 'border-emerald-200',
      };
    case 'Khá':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        border: 'border-blue-200',
      };
    case 'Đạt':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        border: 'border-amber-200',
      };
    case 'Chưa đạt':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        border: 'border-rose-200',
      };
  }
}

/**
 * Tính điểm cho từng học sinh dựa trên record tuần
 */
export function calculateStudentScore(
  student: Student,
  record?: StudentWeeklyRecord
): CalculatedStudentScore {
  const safeRecord: StudentWeeklyRecord = record || {
    studentId: student.id,
    diTre: 0,
    nghiCP: 0,
    nghiKP: 0,
    boTiet: 0,
    ktbKlbKsb: 0,
    khongDongPhuc2: 0,
    diemTot: 0,
    phatBieu: 0,
    khongDongPhuc5: 0,
    matTratTu: 0,
    khongThamGiaVS: 0,
    noiTuc: 0,
    xaRac: 0,
    trucVSBan: 0,
    huHongTS: 0,
    voLeGV: 0,
    dungDienThoai: 0,
  };

  let totalPenalty = 0;
  let totalBonus = 0;

  for (const crit of CRITERIA_LIST) {
    const count = safeRecord[crit.key] || 0;
    if (crit.isBonus) {
      totalBonus += count * crit.points;
    } else {
      totalPenalty += count * Math.abs(crit.points);
    }
  }

  // Điểm trừ / cộng: hiển thị net
  const netChange = totalBonus - totalPenalty;
  // Tổng điểm còn lại = max(0, 100 - trừ + cộng)
  const finalScore = Math.max(0, BASE_SCORE - totalPenalty + totalBonus);
  const classification = getClassification(finalScore);

  return {
    student,
    record: safeRecord,
    baseScore: BASE_SCORE,
    totalPenalty,
    totalBonus,
    netChange,
    finalScore,
    classification,
  };
}

/**
 * Tổng hợp và xếp hạng thi đua cho 6 nhóm (Tổ 1 -> 6)
 */
export function calculateGroupSummaries(
  students: Student[],
  records: Record<string, StudentWeeklyRecord>
): GroupSummary[] {
  // Lớp được chia thành đúng 6 nhóm
  const groups: GroupSummary[] = [];

  for (let gId = 1; gId <= 6; gId++) {
    const groupStudents = students.filter((s) => s.groupId === gId);
    const leader = groupStudents.find((s) => s.isLeader) || groupStudents[0];
    
    const calculatedList = groupStudents.map((s) =>
      calculateStudentScore(s, records[s.id])
    );

    const totalScore = calculatedList.reduce((acc, curr) => acc + curr.finalScore, 0);
    const memberCount = calculatedList.length;
    const averageScore = memberCount > 0 ? Number((totalScore / memberCount).toFixed(2)) : 0;
    const totalPenalty = calculatedList.reduce((acc, curr) => acc + curr.totalPenalty, 0);
    const totalBonus = calculatedList.reduce((acc, curr) => acc + curr.totalBonus, 0);

    const goodCount = calculatedList.filter((c) => c.classification === 'Tốt').length;
    const fairCount = calculatedList.filter((c) => c.classification === 'Khá').length;
    const passCount = calculatedList.filter((c) => c.classification === 'Đạt').length;
    const failCount = calculatedList.filter((c) => c.classification === 'Chưa đạt').length;

    groups.push({
      groupId: gId,
      groupName: `Nhóm ${gId}`,
      leaderName: leader ? leader.name : `Nhóm trưởng ${gId}`,
      memberCount,
      students: calculatedList,
      totalScore,
      averageScore,
      totalPenalty,
      totalBonus,
      goodCount,
      fairCount,
      passCount,
      failCount,
      rank: 1, // Sẽ tính bên dưới
    });
  }

  // Xếp hạng các nhóm dựa trên Điểm trung bình nhóm (cao nhất xếp thứ 1)
  // Nếu bằng điểm thì xét số lượng Tốt cao hơn, hoặc ít điểm trừ hơn
  groups.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    if (b.goodCount !== a.goodCount) {
      return b.goodCount - a.goodCount;
    }
    return a.totalPenalty - b.totalPenalty;
  });

  // Gán thứ hạng
  groups.forEach((group, index) => {
    group.rank = index + 1;
  });

  return groups;
}
