/**
 * Định nghĩa kiểu dữ liệu cho Hệ thống Quản lý Nề nếp THCS
 */

export interface Student {
  id: string;
  stt: number;
  name: string;
  gender: 'Nam' | 'Nữ';
  groupId: number; // 1 -> 6
  isLeader?: boolean; // Nhóm trưởng / Tổ trưởng
  role?: string; // e.g., 'Nhóm trưởng', 'Lớp phó', 'Lớp trưởng', 'Cờ đỏ', 'Thành viên'
}

export interface StudentWeeklyRecord {
  studentId: string;
  // Các tiêu chí theo đúng mẫu bảng thi đua chuẩn THCS
  diTre: number;           // Đi trễ (-2đ)
  nghiCP: number;          // Nghỉ có phép (-2đ)
  nghiKP: number;          // Nghỉ không phép (-4đ)
  boTiet: number;          // Bỏ tiết (-2đ)
  ktbKlbKsb: number;       // Không thuộc bài / không làm bài / không soạn bài (-2đ)
  khongDongPhuc2: number;  // Không đồng phục mức nhẹ (quên khăn quàng, dép lê, bảng tên) (-2đ)
  diemTot: number;         // Điểm tốt 9, 10 (+2đ)
  phatBieu: number;        // Phát biểu xây dựng bài (+1đ)
  khongDongPhuc5: number;  // Không đồng phục mức nặng / sai quy định (-5đ)
  matTratTu: number;       // Mất trật tự trong giờ (-2đ)
  khongThamGiaVS: number;  // Không tham gia vệ sinh (-2đ)
  noiTuc: number;          // Nói tục, chửi thề (-2đ)
  xaRac: number;           // Xả rác trong lớp (-2đ)
  trucVSBan: number;       // Trực vệ sinh bẩn (-2đ)
  huHongTS: number;        // Hư hỏng tài sản (-5đ)
  voLeGV: number;          // Vô lễ với giáo viên (-5đ)
  dungDienThoai: number;   // Sử dụng điện thoại không phép (-10đ)
  
  // Ghi chú chi tiết nếu có
  note?: string;
}

export type ScoreClassification = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

export interface CalculatedStudentScore {
  student: Student;
  record: StudentWeeklyRecord;
  baseScore: number;       // 100 điểm chuẩn
  totalPenalty: number;    // Tổng điểm trừ
  totalBonus: number;      // Tổng điểm cộng
  netChange: number;       // Điểm trừ/cộng (- trừ + cộng)
  finalScore: number;      // Điểm còn lại: Math.max(0, 100 - totalPenalty + totalBonus)
  classification: ScoreClassification;
}

export interface GroupSummary {
  groupId: number;
  groupName: string;
  leaderName: string;
  memberCount: number;
  students: CalculatedStudentScore[];
  totalScore: number;
  averageScore: number;
  totalPenalty: number;
  totalBonus: number;
  goodCount: number;      // Tốt (>= 90)
  fairCount: number;      // Khá (80 - 89)
  passCount: number;      // Đạt (70 - 79)
  failCount: number;      // Chưa đạt (< 70)
  rank: number;           // Hạng 1 -> 6
  prevRank?: number;
}

export type MorningDutyType =
  | 'truyBai'
  | 'khanQuangPhuHieu'
  | 'dongPhuc'
  | 'veSinhLop'
  | 'diTre15p'
  | 'matTratTu15p'
  | 'khac';

export interface MorningDutyRecord {
  id: string;
  weekId: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  studentId: string;
  studentName: string;
  groupId: number;
  violationType: MorningDutyType;
  violationLabel: string;
  penaltyPoints: number; // Điểm trừ tương ứng
  note?: string;
  recordedBy: string; // Tên người ghi nhận (Cờ đỏ, Lớp phó, v.v.)
  createdAt: string;
}

export type AfternoonSessionType =
  | 'TheDuc'
  | 'TinHoc'
  | 'PhuDao'
  | 'HDTN'
  | 'BoiDuong'
  | 'GDDP'
  | 'Khac';

export type AfternoonViolationType =
  | 'vangCP'
  | 'vangKP'
  | 'diTre'
  | 'boTiet'
  | 'khongDongPhuc'
  | 'khongMangDungCu'
  | 'matTratTu'
  | 'khac';

export interface AfternoonRecord {
  id: string;
  weekId: number;
  date: string;
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  sessionName: string; // Tên buổi: "Thể dục Tiết 1-2 Chiều", "Tin học", etc.
  subject: AfternoonSessionType;
  subjectLabel: string;
  studentId: string;
  studentName: string;
  groupId: number;
  violationType: AfternoonViolationType;
  violationLabel: string;
  penaltyPoints: number;
  note?: string;
  recordedBy: string;
  createdAt: string;
}

export interface WeekInfo {
  id: number;
  name: string; // e.g. "Tuần 4"
  startDate: string;
  endDate: string;
  semester: 1 | 2;
  schoolYear: string;
}

export interface ClassMetadata {
  schoolName: string;             // e.g. "Trường TH và THCS Phước Hưng"
  className: string;              // e.g. "9A3"
  grade: number;                  // 6, 7, 8, 9 (cấp THCS)
  semester?: 1 | 2;               // Học kỳ 1 hoặc 2
  homeroomTeacher: string;        // GVCN: Cô Nguyễn Thị Thuỳ Trang
  monitorName: string;            // Lớp trưởng: Trần Gia Hưng
  academicViceMonitorName: string;// Lớp phó Học tập: Nguyễn Thảo Linh
  laborViceMonitorName: string;   // Lớp phó Lao động: Bùi Quang Khải
  disciplineViceMonitorName: string;// Lớp phó Trật tự: Lê Hoàng Yến Nhi
  groupLeaders?: Record<number, string>; // Tên 6 nhóm trưởng (1 đến 6)
  viceMonitorName?: string;       // Tương thích ngược
  academicYear: string;           // 2026 - 2027
}

export interface ScoreAdjustmentLog {
  id: string;
  timestamp: string;          // ISO string
  weekId: number;             // e.g. 4
  weekName?: string;          // "Tuần 4"
  studentId: string;
  studentName: string;
  groupId: number;
  criterionKey: string;       // e.g. "diemTot"
  criterionLabel: string;     // e.g. "Điểm tốt (+2đ)"
  oldValue: number;
  newValue: number;
  delta: number;
  reason: string;             // Lý do điều chỉnh điểm
  editorName: string;         // Người thực hiện điều chỉnh
  editorRole: string;         // Chức vụ người điều chỉnh
  editorAccountId?: string;
}

export type UserRoleType =
  | 'guest'
  | 'gvcn'
  | 'lopTruong'
  | 'lopPhoHocTap'
  | 'lopPhoLaoDong'
  | 'lopPhoTratTu'
  | 'nhomTruong1'
  | 'nhomTruong2'
  | 'nhomTruong3'
  | 'nhomTruong4'
  | 'nhomTruong5'
  | 'nhomTruong6';

export interface GroupWeeklyRemark {
  groupId: number;
  leaderName: string;
  pros: string;             // Ưu điểm trong tuần của nhóm
  cons: string;             // Tồn tại, lỗi vi phạm trong nhóm
  exemplaryStudent: string; // Bạn tiêu biểu đề xuất khen thưởng
  remindStudent: string;    // Bạn cần nhắc nhở chấn chỉnh
  selfRating: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt'; // Nhóm tự đánh giá
  teacherNote?: string;     // Ghi chú ngắn gọn của GVCN cho nhóm cuối tuần (tăng tính phản hồi)
  updatedAt: string;
}

export interface OfficerWeeklyRemarks {
  academicRemark: {
    authorName: string;
    rating: 'Tốt' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
    content: string;       // Báo cáo học tập, truy bài 15p, phát biểu, chuẩn bị bài
    updatedAt?: string;
  };
  laborRemark: {
    authorName: string;
    rating: 'Tốt' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
    content: string;       // Báo cáo vệ sinh phòng học, trực nhật, bảng đen, bàn ghế
    updatedAt?: string;
  };
  disciplineRemark: {
    authorName: string;
    rating: 'Tốt' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
    content: string;       // Báo cáo chuyên cần, trật tự, khăn quàng đỏ, học trái buổi
    updatedAt?: string;
  };
  monitorRemark: {
    authorName: string;
    generalSummary: string;// Báo cáo tổng hợp chung tuần của Lớp trưởng
    updatedAt?: string;
  };
  teacherAdvice: {
    teacherName: string;
    isApproved: boolean;
    advice: string;        // Lời dặn, chỉ đạo của GVCN cho tuần tiếp theo
    updatedAt?: string;
  };
}

export interface WeeklyRemarksStore {
  groupRemarks: Record<number, GroupWeeklyRemark>; // Nhóm 1 -> 6
  officerRemarks: OfficerWeeklyRemarks;
  teacherGroupNotes?: Record<number, string>;      // Ghi chú ngắn gọn của GVCN cho từng nhóm (1 -> 6) cuối tuần
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRoleType;
  displayName: string;
  title: string;
  avatarIcon: string;
  assignedGroupIds?: number[]; // Các nhóm được phép nhập (Nhóm trưởng)
  description?: string;
}

