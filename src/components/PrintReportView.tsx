import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import {
  Student,
  StudentWeeklyRecord,
  GroupSummary,
  WeekInfo,
  ClassMetadata,
  WeeklyRemarksStore,
} from '../types/discipline';
import { calculateStudentScore } from '../utils/scoring';
import { formatDateVN, formatFullTextDateVN } from '../utils/date';

interface PrintReportViewProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ClassMetadata;
  currentWeek: WeekInfo;
  students: Student[];
  records: Record<string, StudentWeeklyRecord>;
  groups: GroupSummary[];
  remarks?: WeeklyRemarksStore;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  isOpen,
  onClose,
  metadata,
  currentWeek,
  students,
  records,
  groups,
  remarks,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculatedList = students.map((s) => calculateStudentScore(s, records[s.id]));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 p-4 sm:p-6 flex flex-col items-center">
      {/* Floating Action Controls */}
      <div className="sticky top-2 z-50 mb-4 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3 print:hidden">
        <span className="text-xs font-bold text-slate-700">
          Xem trước bản in A4 · {currentWeek.name}
        </span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>In Báo Cáo / Lưu PDF</span>
        </button>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 max-w-[1050px] w-full shadow-2xl rounded-sm print:shadow-none print:p-0 print:m-0 font-['Be_Vietnam_Pro',sans-serif]">
        {/* Tiêu ngữ Quốc gia */}
        <div className="flex justify-between items-start text-xs border-b border-slate-300 pb-4 mb-6">
          <div className="text-center font-semibold uppercase">
            <p className="font-bold text-slate-800">{metadata.schoolName ? metadata.schoolName.toUpperCase() : 'TRƯỜNG TH VÀ THCS PHƯỚC HƯNG'}</p>
            <p className="font-bold text-indigo-900">CHI ĐỘI LỚP {metadata.className}</p>
            <p className="font-normal text-[11px] text-slate-500 mt-0.5">
              Năm học: {metadata.academicYear} {metadata.semester ? `(Học kỳ ${metadata.semester})` : ''}
            </p>
          </div>
          <div className="text-center uppercase font-bold">
            <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="text-[11px] font-semibold underline underline-offset-4 normal-case mt-0.5">
              Độc lập - Tự do - Hạnh phúc
            </p>
          </div>
        </div>

        {/* Tiêu đề biểu mẫu */}
        <div className="text-center my-4">
          <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">
            BẢNG THEO DÕI NỀ NẾP & THI ĐUA HỌC SINH
          </h1>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            {currentWeek.name.toUpperCase()} (Từ ngày {formatDateVN(currentWeek.startDate)} đến ngày {formatDateVN(currentWeek.endDate)})
          </p>
          <p className="text-xs text-slate-500 italic mt-0.5">
            GVCN: {metadata.homeroomTeacher} · Sĩ số: {students.length} học sinh · Chia làm 6 nhóm
          </p>
        </div>

        {/* 1. Bảng Xếp Hạng Thi Đua 6 Nhóm */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase text-slate-800 mb-2 flex items-center gap-1.5">
            1. KẾT QUẢ THI ĐUA GIỮA 6 NHÓM TRONG TUẦN:
          </h2>
          <table className="w-full text-[11px] border border-slate-300 text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-300">
                <th className="p-1.5 border-r border-slate-300">Thứ hạng</th>
                <th className="p-1.5 border-r border-slate-300">Tên nhóm</th>
                <th className="p-1.5 border-r border-slate-300">Nhóm trưởng</th>
                <th className="p-1.5 border-r border-slate-300">Sĩ số</th>
                <th className="p-1.5 border-r border-slate-300">Điểm TB nhóm</th>
                <th className="p-1.5 border-r border-slate-300">Điểm trừ vi phạm</th>
                <th className="p-1.5 border-r border-slate-300">Điểm cộng</th>
                <th className="p-1.5 border-r border-slate-300">Số HS Tốt</th>
                <th className="p-1.5">Khen thưởng tuần</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.groupId} className="border-b border-slate-200">
                  <td className="p-1.5 border-r border-slate-300 font-bold">
                    {g.rank === 1 ? 'Hạng 1 (Nhất)' : `Hạng ${g.rank}`}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 font-semibold">{g.groupName}</td>
                  <td className="p-1.5 border-r border-slate-300">{g.leaderName}</td>
                  <td className="p-1.5 border-r border-slate-300">{g.memberCount}</td>
                  <td className="p-1.5 border-r border-slate-300 font-bold font-mono">
                    {g.averageScore}
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-rose-600 font-mono">
                    -{g.totalPenalty}đ
                  </td>
                  <td className="p-1.5 border-r border-slate-300 text-emerald-600 font-mono">
                    +{g.totalBonus}đ
                  </td>
                  <td className="p-1.5 border-r border-slate-300 font-semibold">{g.goodCount}</td>
                  <td className="p-1.5 font-medium">
                    {g.rank === 1
                      ? 'Nhận phần thưởng'
                      : g.rank === 2
                      ? 'Cờ Vàng'
                      : g.rank === 3
                      ? 'Cờ Xanh'
                      : 'Đạt chuẩn'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1 text-[10px] text-slate-600 italic">
            * Quy chế thi đua: Nhóm xếp hạng 1 nhận được phần thưởng, nhóm có học sinh vi phạm nghiêm trọng sẽ bị xử lý theo nội quy của lớp.
          </div>
        </div>

        {/* 2. Bảng Theo Dõi Nề Nếp Chi Tiết (Bản sao chuẩn xác của ảnh người dùng) */}
        <div>
          <h2 className="text-xs font-bold uppercase text-slate-800 mb-2">
            2. BẢNG THEO DÕI NỀ NẾP TỪNG HỌC SINH (Chuẩn Mẫu Thi Đua THCS):
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border border-slate-400 border-collapse text-center">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-400">
                  <th rowSpan={2} className="p-1 border-r border-slate-400 w-6">
                    STT
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400 text-left min-w-[120px]">
                    Họ tên học sinh
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Đi trễ<br />-2
                  </th>
                  <th colSpan={2} className="p-0.5 border-r border-slate-400">
                    Nghỉ học
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Bỏ tiết<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    KTB KLB<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Không ĐP<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400 bg-emerald-50">
                    Điểm tốt +2<br />PB +1
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Mất TT<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    K.VS<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Nói tục<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Xả rác<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Trực bẩn<br />-2
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Hư TS<br />-5
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Vô lễ<br />-5
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Dùng ĐT<br />-10
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400 font-bold bg-slate-200">
                    Điểm chuẩn<br />100
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400">
                    Điểm trừ/cộng
                  </th>
                  <th rowSpan={2} className="p-1 border-r border-slate-400 font-bold bg-indigo-50">
                    Tổng điểm còn lại
                  </th>
                  <th rowSpan={2} className="p-1">
                    Xếp loại
                  </th>
                </tr>
                <tr className="bg-slate-100 font-bold border-b border-slate-400">
                  <th className="p-0.5 border-r border-slate-400">CP -2</th>
                  <th className="p-0.5 border-r border-slate-400">KP -4</th>
                </tr>
              </thead>
              <tbody>
                {calculatedList.map((item, idx) => (
                  <tr key={item.student.id} className="border-b border-slate-300">
                    <td className="p-1 border-r border-slate-300">{idx + 1}</td>
                    <td className="p-1 border-r border-slate-300 text-left font-medium">
                      {item.student.name}{' '}
                      <span className="text-[9px] text-slate-400">(N{item.student.groupId})</span>
                    </td>
                    <td className="p-1 border-r border-slate-300">{item.record.diTre || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.nghiCP || ''}</td>
                    <td className="p-1 border-r border-slate-300 font-semibold text-rose-600">
                      {item.record.nghiKP || ''}
                    </td>
                    <td className="p-1 border-r border-slate-300">{item.record.boTiet || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.ktbKlbKsb || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.khongDongPhuc2 || ''}</td>
                    <td className="p-1 border-r border-slate-300 font-semibold text-emerald-700 bg-emerald-50/30">
                      {item.record.diemTot > 0 ? `${item.record.diemTot}đt ` : ''}
                      {item.record.phatBieu > 0 ? `${item.record.phatBieu}pb` : ''}
                    </td>
                    <td className="p-1 border-r border-slate-300">{item.record.matTratTu || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.khongThamGiaVS || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.noiTuc || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.xaRac || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.trucVSBan || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.huHongTS || ''}</td>
                    <td className="p-1 border-r border-slate-300">{item.record.voLeGV || ''}</td>
                    <td className="p-1 border-r border-slate-300 font-semibold text-rose-700">
                      {item.record.dungDienThoai || ''}
                    </td>
                    <td className="p-1 border-r border-slate-300 font-semibold text-slate-600">100</td>
                    <td className="p-1 border-r border-slate-300 font-semibold">
                      {item.netChange > 0
                        ? `+${item.netChange}`
                        : item.netChange < 0
                        ? `${item.netChange}`
                        : '0'}
                    </td>
                    <td className="p-1 border-r border-slate-300 font-bold bg-indigo-50/50">
                      {item.finalScore}
                    </td>
                    <td className="p-1 font-semibold">{item.classification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footnote */}
          <div className="mt-2 text-[10px] text-slate-600 italic">
            Tổng điểm: từ 90 điểm đến 100, xếp loại Tốt. Tổng điểm: từ 80 điểm đến 89 điểm, xếp loại Khá. Từ 70 điểm đến 79, xếp loại đạt. Dưới 70 xếp loại chưa đạt.
          </div>
        </div>

        {/* 3. Ý kiến nhận xét của Ban cán sự & 6 Nhóm trưởng */}
        {remarks && (
          <div className="mt-6 space-y-3 text-[11px] border-t border-slate-300 pt-4">
            <h2 className="text-xs font-bold uppercase text-slate-800">
              3. NHẬN XÉT CỦA BAN CÁN SỰ & 6 NHÓM TRƯỞNG TRONG TUẦN:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="font-bold text-blue-900">
                  • Lớp phó Học tập ({remarks.officerRemarks.academicRemark.authorName} - Xếp loại: {remarks.officerRemarks.academicRemark.rating}):
                </p>
                <p className="italic mt-0.5">{remarks.officerRemarks.academicRemark.content || 'Nề nếp học tập duy trì tốt.'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="font-bold text-emerald-900">
                  • Lớp phó Lao động ({remarks.officerRemarks.laborRemark.authorName} - Xếp loại: {remarks.officerRemarks.laborRemark.rating}):
                </p>
                <p className="italic mt-0.5">{remarks.officerRemarks.laborRemark.content || 'Vệ sinh phòng học sạch sẽ, đúng quy định.'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="font-bold text-amber-900">
                  • Lớp phó Trật tự ({remarks.officerRemarks.disciplineRemark.authorName} - Xếp loại: {remarks.officerRemarks.disciplineRemark.rating}):
                </p>
                <p className="italic mt-0.5">{remarks.officerRemarks.disciplineRemark.content || 'Đa số các bạn chấp hành nghiêm kỷ luật.'}</p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="font-bold text-indigo-900">
                  • Tổng hợp của Lớp trưởng ({remarks.officerRemarks.monitorRemark.authorName}):
                </p>
                <p className="italic mt-0.5">{remarks.officerRemarks.monitorRemark.generalSummary || 'Lớp hoàn thành tốt các chỉ tiêu thi đua tuần.'}</p>
              </div>
            </div>

            {/* Ý kiến và Lời dặn của GVCN */}
            <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded text-slate-800">
              <p className="font-bold text-purple-900">
                • Ý kiến nhận xét & Lời dặn của Giáo viên chủ nhiệm ({metadata.homeroomTeacher}):
              </p>
              <p className="mt-0.5 italic text-slate-800">{remarks.officerRemarks.teacherAdvice.advice || 'GVCN phê duyệt kết quả thi đua và biểu dương các nhóm dẫn đầu.'}</p>
            </div>

            {/* Ghi chú phản hồi của GVCN cho từng nhóm thi đua cuối tuần */}
            {remarks?.teacherGroupNotes && Object.values(remarks.teacherGroupNotes).some((n) => n?.trim()) && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-300 rounded text-slate-800 space-y-1.5">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span>👩‍🏫</span>
                  <span>Ghi chú phản hồi của GVCN cho từng nhóm thi đua cuối tuần:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  {groups.map((g) => (
                    <div key={g.groupId} className="p-1.5 bg-white border border-amber-200 rounded">
                      <strong className="text-amber-950">{g.groupName} (Hạng {g.rank}):</strong>{' '}
                      <span className="italic text-slate-800">
                        {remarks.teacherGroupNotes?.[g.groupId] || 'Đạt yêu cầu nề nếp tuần.'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dòng địa danh, ngày tháng năm chuẩn mực theo thể thức văn bản */}
        <div className="flex justify-end text-xs italic text-slate-700 mt-8 mb-2 pr-4">
          <span>{formatFullTextDateVN(currentWeek.endDate)}</span>
        </div>

        {/* Chữ ký xác nhận cuối trang */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4 border-t border-slate-200">
          <div>
            <p className="font-bold uppercase">NGƯỜI LẬP BIỂU</p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16" />
            <p className="font-semibold text-slate-800">{metadata.disciplineViceMonitorName || metadata.viceMonitorName}</p>
            <p className="text-[10px] text-slate-500">Lớp phó Kỷ luật / Trật tự</p>
          </div>

          <div>
            <p className="font-bold uppercase">LỚP TRƯỞNG</p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
            <div className="h-16" />
            <p className="font-semibold text-slate-800">{metadata.monitorName}</p>
            <p className="text-[10px] text-slate-500">Đại diện Ban cán sự</p>
          </div>

          <div>
            <p className="font-bold uppercase">GIÁO VIÊN CHỦ NHIỆM</p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">(Phê duyệt & nhận xét)</p>
            <div className="h-16" />
            <p className="font-semibold text-slate-800">{metadata.homeroomTeacher}</p>
            <p className="text-[10px] text-slate-500">GVCN Lớp {metadata.className}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
