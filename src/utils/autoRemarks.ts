import { GroupSummary, GroupWeeklyRemark, OfficerWeeklyRemarks, Student, StudentWeeklyRecord } from '../types/discipline';

export type GroupAutoRemarkData = GroupSummary | (Partial<GroupSummary> & {
  groupId: number;
  averageScore: number;
  rank?: number;
  totalBonus?: number;
  totalPenalty?: number;
});

interface AutoRemarkInput {
  group: GroupAutoRemarkData;
  groupRemark?: GroupWeeklyRemark;
  officerRemarks?: OfficerWeeklyRemarks;
  students?: Student[];
  records?: Record<string, StudentWeeklyRecord>;
}

/**
 * Tự động tạo nhận xét sư phạm của Giáo viên chủ nhiệm cho từng nhóm
 * dựa trên:
 * - Báo cáo nề nếp của Nhóm trưởng (Ưu điểm, Tồn tại, Bạn tiêu biểu, Bạn cần nhắc nhở)
 * - Điểm số, thứ hạng thi đua tuần của nhóm (Hạng 1 -> 6, Điểm trung bình, Điểm cộng, Điểm trừ)
 * - Báo cáo chuyên trách của Ban cán sự (Học tập, Vệ sinh, Kỷ luật)
 */
export function generateAutoTeacherRemarkForGroup({
  group,
  groupRemark,
  officerRemarks,
  students = [],
  records = {},
}: AutoRemarkInput): string {
  const gId = group.groupId;
  const rank = group.rank || gId;
  const avg = group.averageScore.toFixed(1);
  const leaderName = groupRemark?.leaderName || `Nhóm trưởng ${gId}`;
  const exemplary = groupRemark?.exemplaryStudent?.trim();
  const remind = groupRemark?.remindStudent?.trim();
  const pros = groupRemark?.pros?.trim();
  const cons = groupRemark?.cons?.trim();

  // Tìm danh sách học sinh thuộc nhóm này có điểm trừ hoặc vi phạm
  const groupStudents = students.filter((s) => s.groupId === gId);
  const penalizedStudents: { name: string; issues: string[] }[] = [];

  groupStudents.forEach((st) => {
    const rec = records[st.id];
    if (rec) {
      const issues: string[] = [];
      if (rec.diTre && rec.diTre > 0) issues.push(`đi trễ ${rec.diTre} lần`);
      if (rec.khongDongPhuc2 && rec.khongDongPhuc2 > 0) issues.push('quên khăn quàng/đồng phục');
      if (rec.ktbKlbKsb && rec.ktbKlbKsb > 0) issues.push('chưa học/làm bài tập');
      if (rec.matTratTu && rec.matTratTu > 0) issues.push('nói chuyện riêng');
      if (rec.trucVSBan && rec.trucVSBan > 0) issues.push('trực nhật chưa sạch');
      if (rec.xaRac && rec.xaRac > 0) issues.push('để rác bừa bãi');
      if (rec.boTiet && rec.boTiet > 0) issues.push('bỏ tiết');
      if (rec.dungDienThoai && rec.dungDienThoai > 0) issues.push('dùng điện thoại');

      if (issues.length > 0) {
        penalizedStudents.push({ name: st.name, issues });
      }
    }
  });

  const sentences: string[] = [];

  // 1. Câu mở đầu: Đánh giá xếp hạng và điểm số tuần
  if (rank === 1) {
    sentences.push(
      `Biểu dương Nhóm ${gId} xuất sắc dẫn đầu thi đua tuần (Hạng 1 với ${avg} điểm).`
    );
  } else if (rank === 2) {
    sentences.push(
      `Khen ngợi Nhóm ${gId} đạt thành tích xuất sắc, xếp Hạng 2 với ${avg} điểm.`
    );
  } else if (rank === 3) {
    sentences.push(
      `Nhóm ${gId} duy trì nề nếp tốt, xếp Hạng 3 tuần này với ${avg} điểm.`
    );
  } else if (rank === 4) {
    sentences.push(
      `Nhóm ${gId} đạt kết quả Khá (Hạng 4, ${avg} điểm), chấp hành cơ bản tốt quy định lớp.`
    );
  } else if (rank === 5) {
    sentences.push(
      `Nhóm ${gId} xếp Hạng 5 tuần này (${avg} điểm), còn một số tồn tại cần chấn chỉnh kịp thời.`
    );
  } else {
    sentences.push(
      `Nhóm ${gId} xếp cuối bảng tuần này (Hạng 6, ${avg} điểm), kết quả thi đua chưa đạt yêu cầu.`
    );
  }

  // 2. Ghi nhận ưu điểm và cá nhân tiêu biểu
  if (exemplary) {
    if (rank <= 2) {
      sentences.push(`Tuyên dương em ${exemplary} gương mẫu, tích cực đóng góp nhiều điểm tốt cho nhóm.`);
    } else {
      sentences.push(`Ghi nhận em ${exemplary} có tinh thần tự giác và phát biểu tốt.`);
    }
  } else if ((group.totalBonus || 0) > 4) {
    sentences.push(`Biểu dương các bạn trong nhóm hăng hái phát biểu xây dựng bài trong tuần.`);
  }

  if (pros) {
    // Trích lọc ngắn gọn từ ưu điểm nhóm trưởng đã báo cáo
    if (pros.toLowerCase().includes('truy bài')) {
      sentences.push(`Cả nhóm duy trì tốt nề nếp truy bài 15 phút đầu giờ.`);
    } else if (pros.toLowerCase().includes('đồng phục')) {
      sentences.push(`Nhóm chấp hành nghiêm chỉnh nội quy đồng phục và khăn quàng đỏ.`);
    } else {
      sentences.push(`Ưu điểm nổi bật được ghi nhận: ${pros.trim()}.`);
    }
  }

  // 3. Chỉ ra khuyết điểm và nhắc nhở học sinh vi phạm dựa trên báo cáo
  if (remind) {
    if (cons) {
      sentences.push(`Nhắc nhở em ${remind} cần nghiêm túc khắc phục: ${cons.toLowerCase()}.`);
    } else {
      sentences.push(`Yêu cầu em ${remind} nghiêm túc rút kinh nghiệm, không để tái diễn vi phạm.`);
    }
  } else if (cons && cons.length > 5) {
    sentences.push(`Lưu ý tồn tại của nhóm: ${cons.charAt(0).toLowerCase() + cons.slice(1)}.`);
  } else if (penalizedStudents.length > 0) {
    const detailList = penalizedStudents
      .slice(0, 2)
      .map((p) => `${p.name} (${p.issues.join(', ')})`)
      .join('; ');
    sentences.push(`Nhắc nhở em ${detailList} cần chú ý chấn chỉnh nội quy.`);
  } else if ((group.totalPenalty || 0) === 0) {
    sentences.push(`Tuyệt vời, nhóm không có học sinh nào vi phạm lỗi trong tuần!`);
  }

  // 4. Bổ sung phản ánh từ Ban cán sự (Học tập, Lao động, Trật tự) nếu có nhắc tới nhóm
  if (officerRemarks) {
    const gMention = `nhóm ${gId}`;
    const laborText = officerRemarks.laborRemark?.content?.toLowerCase() || '';
    const academicText = officerRemarks.academicRemark?.content?.toLowerCase() || '';
    const discText = officerRemarks.disciplineRemark?.content?.toLowerCase() || '';

    if (laborText.includes(gMention)) {
      if (laborText.includes('sạch') || laborText.includes('tốt')) {
        sentences.push(`Lớp phó Lao động biểu dương nhóm trực nhật vệ sinh sạch sẽ.`);
      } else if (laborText.includes('bẩn') || laborText.includes('bụi') || laborText.includes('rác') || laborText.includes('chưa')) {
        sentences.push(`Lớp phó Lao động lưu ý nhóm cần chú ý trực nhật lau bảng và đổ rác sạch sẽ hơn.`);
      }
    }
    if (academicText.includes(gMention)) {
      if (academicText.includes('tốt') || academicText.includes('điểm cao')) {
        sentences.push(`Lớp phó Học tập đánh giá nhóm có tinh thần học tập tiến bộ.`);
      } else if (academicText.includes('chưa') || academicText.includes('bài tập')) {
        sentences.push(`Lớp phó Học tập lưu ý một số bạn trong nhóm cần chuẩn bị bài tập đầy đủ trước khi đến lớp.`);
      }
    }
    if (discText.includes(gMention) && (discText.includes('ồn') || discText.includes('mất trật tự'))) {
      sentences.push(`Lớp phó Trật tự nhắc nhở nhóm giữ trật tự nghiêm túc trong giờ tự quản.`);
    }
  }

  // 4. Lời dặn dò, định hướng của GVCN cho tuần tiếp theo
  if (rank <= 2) {
    sentences.push(
      `Nhóm trưởng ${leaderName} tiếp tục phát huy tinh thần điều hành và giữ vững vị thế ở tuần tiếp theo.`
    );
  } else if (rank <= 4) {
    sentences.push(
      `Đề nghị các bạn giúp đỡ lẫn nhau trong học tập, đôn đốc trực nhật để nâng cao thứ hạng tuần tới.`
    );
  } else {
    sentences.push(
      `Yêu cầu Nhóm trưởng ${leaderName} kiểm tra chặt chẽ 15p đầu giờ; các bạn vi phạm cần gặp riêng cô để chấn chỉnh.`
    );
  }

  return sentences.join(' ');
}

/**
 * Tự động tạo nhận xét cho toàn bộ 6 nhóm
 */
export function generateAutoTeacherRemarksForAllGroups({
  groups,
  groupRemarks = {},
  officerRemarks,
  students = [],
  records = {},
}: {
  groups: GroupSummary[];
  groupRemarks?: Record<number, GroupWeeklyRemark>;
  officerRemarks?: OfficerWeeklyRemarks;
  students?: Student[];
  records?: Record<string, StudentWeeklyRecord>;
}): Record<number, string> {
  const result: Record<number, string> = {};

  [1, 2, 3, 4, 5, 6].forEach((groupId) => {
    const group = groups.find((g) => g.groupId === groupId) || {
      groupId,
      groupName: `Nhóm ${groupId}`,
      leaderName: groupRemarks[groupId]?.leaderName || `Nhóm trưởng ${groupId}`,
      studentCount: 7,
      averageScore: 100,
      totalBonus: 0,
      totalPenalty: 0,
      rank: groupId,
      topStudents: [],
      studentsNeedingImprovement: [],
    };

    result[groupId] = generateAutoTeacherRemarkForGroup({
      group,
      groupRemark: groupRemarks[groupId],
      officerRemarks,
      students,
      records,
    });
  });

  return result;
}
