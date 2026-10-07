import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Settings2,
} from 'lucide-react';
import { UserAccount } from '../types/discipline';
import { getRolePermissionBadge } from '../utils/permissions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  currentAccountId: string;
  isLoggedIn?: boolean;
  onLogin: (accountId: string) => void;
  onLogout?: () => void;
  onOpenAccountManager?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currentAccountId,
  isLoggedIn = true,
  onLogin,
  onLogout,
  onOpenAccountManager,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const currentAccount = accounts.find((a) => a.id === currentAccountId);
  const isCurrentlyActive = isLoggedIn && !!currentAccount;

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const matched = accounts.find(
      (a) =>
        a.username.toLowerCase() === username.trim().toLowerCase() &&
        a.password === password.trim()
    );

    if (!matched) {
      setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác!');
      return;
    }

    const isStudent = matched.role !== 'gvcn';
    setSuccessMessage(
      isStudent
        ? `Đăng nhập thành công: Học sinh ${matched.displayName} (${matched.title})!`
        : `Đăng nhập thành công: ${matched.displayName} (${matched.title})!`
    );
    setTimeout(() => {
      onLogin(matched.id);
      setSuccessMessage('');
      setUsername('');
      setPassword('');
      onClose();
    }, 500);
  };

  const handleQuickSelectAccount = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password || '123');
    setErrorMessage('');
  };

  const handleQuickLoginNow = (acc: UserAccount) => {
    const isStudent = acc.role !== 'gvcn';
    setSuccessMessage(
      isStudent
        ? `Đăng nhập thành công: Học sinh ${acc.displayName} (${acc.title})!`
        : `Đăng nhập thành công: ${acc.displayName} (${acc.title})!`
    );
    setTimeout(() => {
      onLogin(acc.id);
      setSuccessMessage('');
      onClose();
    }, 350);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      setSuccessMessage('Đã đăng xuất khỏi tất cả các tài khoản thành công!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-indigo-950 flex items-center justify-center shadow-md font-bold text-lg shrink-0">
              <KeyRound className="w-5 h-5 text-indigo-950" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Đăng Nhập Tài Khoản Báo Cáo</span>
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                GVCN, Lớp trưởng, các Lớp phó chuyên trách & 6 Nhóm trưởng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Trạng thái tài khoản hiện tại */}
          {isCurrentlyActive && currentAccount ? (
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-300 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentAccount.avatarIcon}</span>
                  <div>
                    <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                      {currentAccount.role === 'gvcn' ? 'Giáo viên phụ trách:' : 'Học sinh đang đăng nhập:'}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-black text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                        {currentAccount.displayName}
                      </span>
                      <span className="text-[11px] bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300">
                        {currentAccount.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Tên tài khoản: <strong className="text-slate-800 font-mono">@{currentAccount.username}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quản lý mật khẩu: CHỈ HIỂN THỊ VỚI GVCN */}
                  {currentAccount.role === 'gvcn' && onOpenAccountManager && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAccountManager();
                      }}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      title="Quản lý tài khoản & Mật khẩu học sinh"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Quản lý MK</span>
                    </button>
                  )}

                  {/* Nút Đăng xuất tất cả các tài khoản */}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      title="Đăng xuất khỏi tất cả các tài khoản"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Đăng xuất tất cả các tài khoản</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Huy hiệu quyền hạn */}
              {(() => {
                const badge = getRolePermissionBadge(currentAccount.role, currentAccount.assignedGroupIds);
                return (
                  <div className="pt-2 border-t border-emerald-200/70 flex items-center gap-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-bold border ${badge.badgeColor}`}>
                      {badge.badgeText}
                    </span>
                    <span className="text-slate-600 truncate">{badge.scopeText}</span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Hiện đang ở <strong>Chế độ chỉ xem</strong>. Vui lòng chọn học sinh / tài khoản bên dưới để đăng nhập ghi nhận nề nếp.
              </span>
            </div>
          )}

          {/* Danh sách tài khoản cán sự & nhóm trưởng để chọn nhanh */}
          <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋</span>
                <span>Danh Sách Học Sinh Phụ Trách & Tài Khoản:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Bấm để chọn / đăng nhập nhanh</span>
            </div>

            {/* Nhóm 1: Ban Cán Sự Lớp & GVCN */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Ban Cán Sự Lớp & GVCN:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts
                  .filter((a) => !a.role.startsWith('nhomTruong'))
                  .map((acc) => {
                    const isSelected = username.toLowerCase() === acc.username.toLowerCase();
                    const isCurrent = currentAccount?.id === acc.id;
                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleQuickSelectAccount(acc)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                            : isSelected
                            ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{acc.avatarIcon}</span>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 truncate text-[11px] sm:text-xs">
                              {acc.displayName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {acc.title} · <code className="text-indigo-600 font-mono font-bold">@{acc.username}</code>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLoginNow(acc);
                          }}
                          className="shrink-0 px-2 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-2xs transition-colors cursor-pointer"
                          title={`Đăng nhập ngay với tài khoản em ${acc.displayName}`}
                        >
                          Vào
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Nhóm 2: 6 Nhóm Trưởng (phụ trách chấm điểm nhóm đó) */}
            <div className="space-y-1 pt-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                <span>6 Nhóm Trưởng (Chấm điểm nhóm tương ứng):</span>
                <span className="text-[10px] text-sky-700 font-semibold lowercase">nhóm nào chấm nhóm đó</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {accounts
                  .filter((a) => a.role.startsWith('nhomTruong'))
                  .map((acc) => {
                    const isSelected = username.toLowerCase() === acc.username.toLowerCase();
                    const isCurrent = currentAccount?.id === acc.id;
                    const groupNum = acc.role.replace('nhomTruong', '');
                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleQuickSelectAccount(acc)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                            : isSelected
                            ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">🚩</span>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 truncate text-[11px]">
                              {acc.displayName}
                            </p>
                            <p className="text-[10px] text-sky-700 font-semibold truncate">
                              Nhóm trưởng {groupNum} (<code className="font-mono">@{acc.username}</code>)
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLoginNow(acc);
                          }}
                          className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors cursor-pointer"
                          title={`Đăng nhập tài khoản Nhóm trưởng ${groupNum} (${acc.displayName})`}
                        >
                          Vào
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Form đăng nhập */}
          <form onSubmit={handleFormLogin} className="space-y-3.5 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                {isCurrentlyActive ? 'Đăng Nhập Tài Khoản Khác' : 'Thông Tin Đăng Nhập'}
              </h4>
              <span className="text-[10px] text-slate-500">Mật khẩu mặc định: 123</span>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên tài khoản (Username)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: gvcn, loptruong, lophoc, nhom1..."
                    className="w-full text-xs font-bold p-2.5 pl-8 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full text-xs font-bold p-2.5 pl-8 pr-8 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Xác Nhận Đăng Nhập</span>
              </button>
            </div>
          </form>

          {/* Lưu ý bảo mật */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <span>🛡️</span>
              <span>Bảo mật tài khoản ban cán sự:</span>
            </p>
            <p>
              Mỗi cán bộ lớp (Lớp trưởng, các Lớp phó, 6 Nhóm trưởng) sử dụng tài khoản cá nhân do GVCN cấp phát để nhập điểm và báo cáo thi đua tuần.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
