import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  SchoolAssetItem,
  AssetCategory,
  AssetCondition,
  AssetCheckoutUsage,
  UserRole,
  PortalAccount,
  SchoolClass,
  FcmNotification,
} from '../types/school';
import { SCHOOL_TEACHERS } from '../data/mockData';
import { createLowStockFcmPayload } from '../utils/schoolLogic';
import {
  Package,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Edit3,
  Trash2,
  Wrench,
  Layers,
  ArrowRight,
  Eye,
  X,
  Boxes,
  DollarSign,
  Tag,
  MapPin,
  Calendar,
  Check,
  Smartphone,
  ShieldAlert,
  BellRing,
  Send,
} from 'lucide-react';

const SCHOOL_CLASSES_LIST: SchoolClass[] = [
  'HateKhori',
  'Play',
  'Nursery',
  'KG',
  'Class-1',
  'Class-2',
];

interface SchoolAssetsModuleProps {
  assets: SchoolAssetItem[];
  onUpdateAssets: (assets: SchoolAssetItem[]) => void;
  currentRole: UserRole;
  loggedInAccount?: PortalAccount | null;
  onSendLowStockNotification?: (notif: FcmNotification) => void;
}

const CATEGORY_LABELS: Record<AssetCategory, { labelBn: string; color: string; bg: string }> = {
  montessori_toys: {
    labelBn: 'মন্টেসরি খেলনা',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  classroom_supplies: {
    labelBn: 'স্টেশনারি ও খাতা',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  art_craft: {
    labelBn: 'আর্ট ও ক্রাফট',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
  },
  electronics_digital: {
    labelBn: 'ডিজিটাল ও স্পিকার',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  sports_play: {
    labelBn: 'খেলার সামগ্রী',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  medical_safety: {
    labelBn: 'ফার্স্ট এইড ও নিরাপত্তা',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
  furniture_fixtures: {
    labelBn: 'ফার্নিচার ও শেলফ',
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
  },
};

const CONDITION_LABELS: Record<AssetCondition, { labelBn: string; color: string; bg: string }> = {
  excellent: {
    labelBn: 'চমৎকার (নতুন)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  good: {
    labelBn: 'ব্যবহারযোগ্য (ভালো)',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  needs_repair: {
    labelBn: 'মেরামত প্রয়োজন',
    color: 'text-amber-800',
    bg: 'bg-amber-50 border-amber-300',
  },
  damaged: {
    labelBn: 'ত্রুটিযুক্ত / বাদ',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
};

export const SchoolAssetsModule: React.FC<SchoolAssetsModuleProps> = ({
  assets,
  onUpdateAssets,
  currentRole,
  loggedInAccount,
  onSendLowStockNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'checkouts'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<AssetCondition | 'all'>('all');
  const [onlyLowStockFilter, setOnlyLowStockFilter] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<SchoolAssetItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Checkout
  const [checkoutTeacher, setCheckoutTeacher] = useState(
    loggedInAccount?.role === 'teacher' ? loggedInAccount.nameBn : SCHOOL_TEACHERS[0].nameBn
  );
  const [checkoutClass, setCheckoutClass] = useState<SchoolClass>('Play');
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);
  const [checkoutPurpose, setCheckoutPurpose] = useState('');
  const [checkoutReturnDate, setCheckoutReturnDate] = useState('আজ, ক্লাস শেষে');

  // Form states for Add/Edit
  const [formAssetCode, setFormAssetCode] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCategory, setFormCategory] = useState<AssetCategory>('montessori_toys');
  const [formLocation, setFormLocation] = useState('মন্টেসরি ল্যাব ও রিসোর্স সেন্টার');
  const [formTotalQty, setFormTotalQty] = useState<number>(10);
  const [formUnit, setFormUnit] = useState('সেট');
  const [formCondition, setFormCondition] = useState<AssetCondition>('excellent');
  const [formCost, setFormCost] = useState<number>(5000);
  const [formTeacher, setFormTeacher] = useState(SCHOOL_TEACHERS[0].nameBn);
  const [formMaintenance, setFormMaintenance] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('/assets/fb/photo-1.jpg');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number>(3);

  // Track notified assets this session to avoid spamming
  const notifiedAssetsRef = useRef<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Automated notification trigger
  const triggerLowStockAlert = (asset: SchoolAssetItem, force = false): boolean => {
    const threshold = asset.lowStockThreshold ?? 2;
    if (asset.availableQuantity <= threshold) {
      if (force || !notifiedAssetsRef.current.has(asset.id)) {
        notifiedAssetsRef.current.add(asset.id);
        const now = new Date();
        const timeLabel = `আজ ${now.toLocaleTimeString('bn-BD', {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
        const notif = createLowStockFcmPayload(asset, timeLabel);
        if (onSendLowStockNotification) {
          onSendLowStockNotification(notif);
        }
        return true;
      }
    }
    return false;
  };

  // Check on load for any low stock items and notify admin automatically
  useEffect(() => {
    assets.forEach((item) => {
      const threshold = item.lowStockThreshold ?? 2;
      if (item.availableQuantity <= threshold && !notifiedAssetsRef.current.has(item.id)) {
        triggerLowStockAlert(item);
      }
    });
  }, [assets]);

  // Permissions: Super Admin, Principal, and Director can edit and add assets.
  const canManageAssets =
    currentRole === 'super_admin' ||
    currentRole === 'principal' ||
    currentRole === 'director';

  // Metrics
  const metrics = useMemo(() => {
    const totalVarieties = assets.length;
    let totalItems = 0;
    let inStockItems = 0;
    let checkedOutItems = 0;
    let needsRepairCount = 0;
    let totalValueBdt = 0;
    let lowStockCount = 0;

    assets.forEach((item) => {
      totalItems += item.totalQuantity || 0;
      inStockItems += item.availableQuantity || 0;
      checkedOutItems += item.inUseQuantity || 0;
      const threshold = item.lowStockThreshold ?? 2;
      if (item.availableQuantity <= threshold) {
        lowStockCount += 1;
      }
      if (item.condition === 'needs_repair' || item.condition === 'damaged') {
        needsRepairCount += 1;
      }
      totalValueBdt += item.costEstimateBdt || 0;
    });

    const totalActiveBorrows = assets.reduce(
      (acc, item) =>
        acc + (item.activeUsages?.filter((u) => u.status === 'active_borrowed').length || 0),
      0
    );

    return {
      totalVarieties,
      totalItems,
      inStockItems,
      checkedOutItems,
      needsRepairCount,
      totalValueBdt,
      totalActiveBorrows,
      lowStockCount,
    };
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const threshold = item.lowStockThreshold ?? 2;
      const isLowStock = item.availableQuantity <= threshold;

      if (onlyLowStockFilter && !isLowStock) {
        return false;
      }

      const matchSearch =
        !searchQuery.trim() ||
        item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationRoomBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.assignedTeacherNameBn &&
          item.assignedTeacherNameBn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchCondition =
        selectedCondition === 'all' || item.condition === selectedCondition;

      return matchSearch && matchCategory && matchCondition;
    });
  }, [assets, searchQuery, selectedCategory, selectedCondition, onlyLowStockFilter]);

  // Active checkouts across all items
  const allActiveCheckouts = useMemo(() => {
    const checkouts: AssetCheckoutUsage[] = [];
    assets.forEach((item) => {
      if (item.activeUsages && item.activeUsages.length > 0) {
        item.activeUsages.forEach((u) => {
          checkouts.push(u);
        });
      }
    });
    return checkouts.sort((a, b) => (a.status === 'active_borrowed' ? -1 : 1));
  }, [assets]);

  // Open Checkout Modal
  const handleOpenCheckoutModal = (asset: SchoolAssetItem) => {
    setSelectedAsset(asset);
    setCheckoutQuantity(Math.min(1, asset.availableQuantity));
    setCheckoutPurpose('');
    setCheckoutReturnDate('আজ, ক্লাস শেষে');
    setIsCheckoutModalOpen(true);
  };

  // Confirm Checkout
  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    if (checkoutQuantity <= 0) {
      showToast('⚠️ অনুগ্রহ করে কমপক্ষে ১টি পরিমাণ নির্বাচন করুন।');
      return;
    }

    if (checkoutQuantity > selectedAsset.availableQuantity) {
      showToast('⚠️ মজুদের চেয়ে বেশি পরিমাণ ধার দেওয়া সম্ভব নয়।');
      return;
    }

    const now = new Date();
    const timeBn = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')} ${
      now.getHours() >= 12 ? 'দুপুর' : 'সকাল'
    }`;
    const dateBn = `${now.getDate()} নভেম্বর ২০২৬`;

    const newUsage: AssetCheckoutUsage = {
      id: `usg-${Date.now()}`,
      assetId: selectedAsset.id,
      assetNameBn: selectedAsset.nameBn,
      checkedOutByTeacherNameBn: checkoutTeacher,
      className: checkoutClass,
      purposeBn: checkoutPurpose.trim() || 'ক্লাস অ্যাক্টিভিটি ও শিক্ষাদান',
      borrowDateBn: dateBn,
      borrowTimeBn: timeBn,
      expectedReturnDateBn: checkoutReturnDate,
      status: 'active_borrowed',
      quantityBorrowed: checkoutQuantity,
      remarksBn: `${checkoutClass} শ্রেণিকক্ষে ব্যবহারের জন্য প্রদান করা হয়েছে।`,
    };

    let nextAvailable = 0;
    const updatedAssets = assets.map((item) => {
      if (item.id === selectedAsset.id) {
        nextAvailable = Math.max(0, item.availableQuantity - checkoutQuantity);
        const nextInUse = item.inUseQuantity + checkoutQuantity;
        const currentUsages = item.activeUsages || [];
        return {
          ...item,
          availableQuantity: nextAvailable,
          inUseQuantity: nextInUse,
          activeUsages: [newUsage, ...currentUsages],
        };
      }
      return item;
    });

    onUpdateAssets(updatedAssets);
    setIsCheckoutModalOpen(false);

    // Check if item dropped below threshold
    const threshold = selectedAsset.lowStockThreshold ?? 2;
    if (nextAvailable <= threshold) {
      const updatedAssetItem = {
        ...selectedAsset,
        availableQuantity: nextAvailable,
        inUseQuantity: selectedAsset.inUseQuantity + checkoutQuantity,
      };
      triggerLowStockAlert(updatedAssetItem, true);
      showToast(
        `🚨 সতর্কতা: "${selectedAsset.nameBn}" এর স্টক কমে ${nextAvailable} ${selectedAsset.unitBn}-এ নেমেছে! অ্যাডমিনকে পুশ অ্যালার্ট পাঠানো হয়েছে।`
      );
    } else {
      showToast(`✓ "${selectedAsset.nameBn}" সফলভাবে ${checkoutTeacher}-কে ইস্যু করা হয়েছে।`);
    }
  };

  // Return Item
  const handleReturnItem = (assetId: string, usageId: string) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return;

    const targetUsage = targetAsset.activeUsages?.find((u) => u.id === usageId);
    if (!targetUsage || targetUsage.status === 'returned') return;

    const returnQty = targetUsage.quantityBorrowed;
    const now = new Date();
    const returnTimeBn = `আজ, ${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )} ${now.getHours() >= 12 ? 'দুপুর' : 'সকাল'}`;

    const updatedAssets = assets.map((item) => {
      if (item.id === assetId) {
        const nextAvailable = item.availableQuantity + returnQty;
        const nextInUse = Math.max(0, item.inUseQuantity - returnQty);
        const nextUsages = (item.activeUsages || []).map((u) => {
          if (u.id === usageId) {
            return {
              ...u,
              status: 'returned' as const,
              returnedDateBn: returnTimeBn,
            };
          }
          return u;
        });

        return {
          ...item,
          availableQuantity: nextAvailable,
          inUseQuantity: nextInUse,
          activeUsages: nextUsages,
        };
      }
      return item;
    });

    onUpdateAssets(updatedAssets);
    showToast(`✓ "${targetAsset.nameBn}" সফলভাবে ফেরত গ্রহণ ও স্টকে যুক্ত করা হয়েছে।`);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextCodeNumber = assets.length + 101;
    setFormAssetCode(`AP-AST-${nextCodeNumber}`);
    setFormNameBn('');
    setFormNameEn('');
    setFormCategory('montessori_toys');
    setFormLocation('মন্টেসরি ল্যাব ও রিসোর্স সেন্টার');
    setFormTotalQty(10);
    setFormUnit('সেট');
    setFormCondition('excellent');
    setFormCost(5000);
    setFormTeacher(SCHOOL_TEACHERS[0].nameBn);
    setFormMaintenance('নিয়মিত পরিষ্কার ও জীবাণুমুক্ত রাখা হয়।');
    setFormPhotoUrl('/assets/fb/photo-1.jpg');
    setFormLowStockThreshold(3);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (asset: SchoolAssetItem) => {
    setSelectedAsset(asset);
    setFormAssetCode(asset.assetCode);
    setFormNameBn(asset.nameBn);
    setFormNameEn(asset.nameEn);
    setFormCategory(asset.category);
    setFormLocation(asset.locationRoomBn);
    setFormTotalQty(asset.totalQuantity);
    setFormUnit(asset.unitBn);
    setFormCondition(asset.condition);
    setFormCost(asset.costEstimateBdt || 0);
    setFormTeacher(asset.assignedTeacherNameBn || SCHOOL_TEACHERS[0].nameBn);
    setFormMaintenance(asset.maintenanceNoteBn || '');
    setFormPhotoUrl(asset.photoUrl || '/assets/fb/photo-1.jpg');
    setFormLowStockThreshold(asset.lowStockThreshold ?? 2);
    setIsEditModalOpen(true);
  };

  // Submit Add Asset
  const handleSaveNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameBn.trim()) {
      showToast('⚠️ উপকরণের বাংলা নাম আবশ্যক।');
      return;
    }

    const catMeta = CATEGORY_LABELS[formCategory];
    const condMeta = CONDITION_LABELS[formCondition];
    const threshold = Number(formLowStockThreshold) || 2;
    const initialQty = Number(formTotalQty) || 1;

    const newAsset: SchoolAssetItem = {
      id: `ast-${Date.now()}`,
      assetCode: formAssetCode.trim() || `AP-AST-${assets.length + 101}`,
      nameBn: formNameBn.trim(),
      nameEn: formNameEn.trim() || formNameBn.trim(),
      category: formCategory,
      categoryBn: catMeta.labelBn,
      locationRoomBn: formLocation.trim() || 'প্রধান স্টোররুম',
      totalQuantity: initialQty,
      availableQuantity: initialQty,
      inUseQuantity: 0,
      unitBn: formUnit.trim() || 'টি',
      condition: formCondition,
      conditionBn: condMeta.labelBn,
      purchaseDateBn: 'নভেম্বর ২০২৬',
      costEstimateBdt: Number(formCost) || 0,
      photoUrl: formPhotoUrl,
      assignedTeacherNameBn: formTeacher,
      lastAuditedDateBn: '০৬ নভেম্বর ২০২৬',
      maintenanceNoteBn: formMaintenance.trim() || 'সঠিকভাবে সংরক্ষণ করা হচ্ছে।',
      lowStockThreshold: threshold,
      activeUsages: [],
    };

    onUpdateAssets([newAsset, ...assets]);
    setIsAddModalOpen(false);

    if (newAsset.availableQuantity <= threshold) {
      triggerLowStockAlert(newAsset, true);
    }

    showToast(`✓ নতুন উপকরণ "${newAsset.nameBn}" সফলভাবে ইনভেন্টরিতে যুক্ত হয়েছে।`);
  };

  // Submit Edit Asset
  const handleSaveEditedAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const catMeta = CATEGORY_LABELS[formCategory];
    const condMeta = CONDITION_LABELS[formCondition];
    const updatedTotal = Number(formTotalQty) || selectedAsset.totalQuantity;
    const currentInUse = selectedAsset.inUseQuantity;
    const nextAvailable = Math.max(0, updatedTotal - currentInUse);
    const threshold = Number(formLowStockThreshold) || 2;

    const updatedAssets = assets.map((item) => {
      if (item.id === selectedAsset.id) {
        return {
          ...item,
          assetCode: formAssetCode.trim() || item.assetCode,
          nameBn: formNameBn.trim() || item.nameBn,
          nameEn: formNameEn.trim() || item.nameEn,
          category: formCategory,
          categoryBn: catMeta.labelBn,
          locationRoomBn: formLocation.trim() || item.locationRoomBn,
          totalQuantity: updatedTotal,
          availableQuantity: nextAvailable,
          unitBn: formUnit.trim() || item.unitBn,
          condition: formCondition,
          conditionBn: condMeta.labelBn,
          costEstimateBdt: Number(formCost) || 0,
          photoUrl: formPhotoUrl,
          assignedTeacherNameBn: formTeacher,
          maintenanceNoteBn: formMaintenance.trim() || item.maintenanceNoteBn,
          lowStockThreshold: threshold,
          lastAuditedDateBn: '০৬ নভেম্বর ২০২৬ (আপডেট)',
        };
      }
      return item;
    });

    onUpdateAssets(updatedAssets);
    setIsEditModalOpen(false);

    if (nextAvailable <= threshold) {
      triggerLowStockAlert(
        {
          ...selectedAsset,
          availableQuantity: nextAvailable,
          lowStockThreshold: threshold,
        },
        true
      );
    }

    showToast(`✓ উপকরণ "${formNameBn}" এর তথ্য সফলভাবে আপডেট হয়েছে।`);
  };

  // Delete Asset
  const handleDeleteAsset = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;

    if (target.inUseQuantity > 0) {
      showToast('⚠️ এই উপকরণটি বর্তমানে ক্লাসরুমে ব্যবহৃত হচ্ছে। আগে ফেরত নিন।');
      return;
    }

    if (window.confirm(`আপনি কি নিশ্চিত যে "${target.nameBn}" ইনভেন্টরি থেকে মুছে ফেলতে চান?`)) {
      const updated = assets.filter((a) => a.id !== assetId);
      onUpdateAssets(updated);
      showToast(`✓ "${target.nameBn}" ইনভেন্টরি থেকে অপসারিত হয়েছে।`);
    }
  };

  // Trigger manual low stock alert test for an asset
  const handleTriggerManualAlert = (asset: SchoolAssetItem) => {
    triggerLowStockAlert(asset, true);
    showToast(`✓ "${asset.nameBn}" এর জন্য অ্যাডমিনের নিকট সফলভাবে লো-স্টক পুশ নোটিফিকেশন পাঠানো হয়েছে।`);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'অ্যাসেট কোড',
      'উপকরণের নাম (বাংলা)',
      'ইংরেজি নাম',
      'ক্যাটাগরি',
      'রুম / লোকেশন',
      'মোট পরিমাণ',
      'মজুত (উপলব্ধ)',
      'ব্যবহারাধীন (ইস্যুকৃত)',
      'একক',
      'লো-স্টক সীমা',
      'স্টক অবস্থা',
      'উপকরণের মান',
      'আনুমানিক মূল্য (টাকা)',
      'দায়িত্বপ্রাপ্ত শিক্ষক',
      'রক্ষণাবেক্ষণ মন্তব্য',
    ];

    const rows = assets.map((item) => {
      const threshold = item.lowStockThreshold ?? 2;
      const isLowStock = item.availableQuantity <= threshold;
      return [
        `"${item.assetCode}"`,
        `"${item.nameBn.replace(/"/g, '""')}"`,
        `"${item.nameEn.replace(/"/g, '""')}"`,
        `"${item.categoryBn}"`,
        `"${item.locationRoomBn.replace(/"/g, '""')}"`,
        item.totalQuantity,
        item.availableQuantity,
        item.inUseQuantity,
        `"${item.unitBn}"`,
        threshold,
        isLowStock ? '"⚠️ লো-স্টক (ঘাটতি)"' : '"পর্যাপ্ত মজুত"',
        `"${item.conditionBn}"`,
        item.costEstimateBdt || 0,
        `"${item.assignedTeacherNameBn || ''}"`,
        `"${(item.maintenanceNoteBn || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ananda_pathshala_school_assets_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('✓ অফিসিয়াল ইনভেন্টরি CSV রিপোর্ট সফলভাবে ডাউনলোড হয়েছে।');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Package className="w-3.5 h-3.5 text-amber-300" />
              <span>স্কুল সম্পদ ও ইনভেন্টরি অটোমেশন</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>স্কুল অ্যাসেট ও ইনভেন্টরি ট্র্যাকার</span>
              {metrics.lowStockCount > 0 && (
                <span className="text-xs bg-rose-500/90 text-white font-mono px-2.5 py-1 rounded-full border border-rose-400/60 flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{metrics.lowStockCount}টি লো-স্টক</span>
                </span>
              )}
            </h1>
            <p className="text-amber-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              মন্টেসরি ব্লেন্ডেড কারিকুলামের শিক্ষা উপকরণ ও আর্ট সামগ্রীর মজুত পর্যবেক্ষণ। কোনো উপকরণের মজুত নির্ধারিত সীমার নিচে নামলেই স্বয়ংক্রিয় লাল সতর্কতা ও অ্যাডমিন পুশ নোটিফিকেশন প্রেরিত হয়।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              title="ইনভেন্টরি তালিকা CSV ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>CSV এক্সপোর্ট</span>
            </button>

            {canManageAssets && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন উপকরণ যোগ</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Total Varieties */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">মোট উপকরণ</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {metrics.totalVarieties} <span className="text-xs font-normal text-slate-500">প্রকার</span>
          </div>
          <div className="text-[11px] text-slate-500">
            সর্বমোট: <span className="font-bold text-slate-700">{metrics.totalItems} টি</span>
          </div>
        </div>

        {/* Metric 2: Available in Stock */}
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs">
            <span className="font-semibold">স্টকে মজুত</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {metrics.inStockItems} <span className="text-xs font-normal text-emerald-600">টি</span>
          </div>
          <div className="text-[11px] text-emerald-700">ব্যবহারের জন্য প্রস্তুত</div>
        </div>

        {/* Metric 3: Low Stock Alert Card (HIGHLIGHTED) */}
        <div
          onClick={() => setOnlyLowStockFilter((prev) => !prev)}
          className={`rounded-2xl border p-4 shadow-2xs space-y-1 cursor-pointer transition-all ${
            metrics.lowStockCount > 0
              ? onlyLowStockFilter
                ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-300'
                : 'bg-rose-50 border-rose-300 hover:border-rose-400 hover:shadow-xs'
              : 'bg-white border-slate-200'
          }`}
          title="ক্লিক করে শুধুমাত্র লো-স্টক সতর্কবার্তা বিশিষ্ট আইটেম দেখুন"
        >
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${onlyLowStockFilter ? 'text-white' : 'text-rose-800'}`}>
              🚨 লো-স্টক সতর্কবার্তা
            </span>
            <AlertTriangle className={`w-4 h-4 ${onlyLowStockFilter ? 'text-white' : 'text-rose-600'}`} />
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              onlyLowStockFilter ? 'text-white' : 'text-rose-700'
            }`}
          >
            {metrics.lowStockCount} <span className="text-xs font-normal">প্রকার</span>
          </div>
          <div
            className={`text-[11px] font-bold ${
              onlyLowStockFilter ? 'text-rose-100' : 'text-rose-700'
            }`}
          >
            {metrics.lowStockCount > 0
              ? onlyLowStockFilter
                ? 'ফিল্টার সক্রিয় · সব দেখতে ক্লিক করুন'
                : 'সীমা অতিক্রম · ক্লিক করে ফিল্টার'
              : '✓ সব স্টক পর্যাপ্ত'}
          </div>
        </div>

        {/* Metric 4: In Use Checked Out */}
        <div className="bg-white rounded-2xl border border-indigo-200 bg-indigo-50/20 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-800 text-xs">
            <span className="font-semibold">ক্লাসে ব্যবহৃত</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">
            {metrics.checkedOutItems} <span className="text-xs font-normal text-indigo-600">টি</span>
          </div>
          <div className="text-[11px] text-indigo-700">
            রিকুইজিশন: <span className="font-bold">{metrics.totalActiveBorrows} টি</span>
          </div>
        </div>

        {/* Metric 5: Needs Repair */}
        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800 text-xs">
            <span className="font-semibold">মেরামত / সার্ভিসিং</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">
            {metrics.needsRepairCount}{' '}
            <span className="text-xs font-normal text-amber-700">প্রকার</span>
          </div>
          <div className="text-[11px] text-amber-700">
            {metrics.needsRepairCount > 0 ? 'সার্ভিসিং ও পার্টস চেক' : 'সব সামগ্রী সচল'}
          </div>
        </div>

        {/* Metric 6: Inventory Valuation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">ইনভেন্টরি মূল্য</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ৳ {metrics.totalValueBdt.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">অডিট মূল্যায়ন ২০২৬</div>
        </div>
      </div>

      {/* Main Tabs Navigation (Inventory vs Active Checkouts) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-amber-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>সামগ্রী তালিকা ও স্টক ({filteredAssets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checkouts')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'checkouts'
                ? 'bg-amber-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ইস্যুকৃত রেজিস্টার ও রিকুইজিশন</span>
            {metrics.totalActiveBorrows > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-mono">
                {metrics.totalActiveBorrows}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, কোড, রুম বা শিক্ষকের নাম..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category & Status Filter Chips (Only for Inventory tab) */}
      {activeTab === 'inventory' && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            ফিল্টার:
          </span>

          {/* Quick Low Stock Button */}
          <button
            type="button"
            onClick={() => setOnlyLowStockFilter((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              onlyLowStockFilter
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ লো-স্টক সতর্কবার্তা ({metrics.lowStockCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setOnlyLowStockFilter(false);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all' && !onlyLowStockFilter
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            সব ক্যাটাগরি
          </button>

          {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map((catKey) => {
            const meta = CATEGORY_LABELS[catKey];
            const isSelected = selectedCategory === catKey && !onlyLowStockFilter;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => {
                  setSelectedCategory(catKey);
                  setOnlyLowStockFilter(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {meta.labelBn}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 cursor-pointer"
          >
            <option value="all">সব অবস্থা</option>
            <option value="excellent">চমৎকার (নতুন)</option>
            <option value="good">ভালো অবস্থা</option>
            <option value="needs_repair">মেরামত প্রয়োজন</option>
            <option value="damaged">ত্রুটিযুক্ত</option>
          </select>
        </div>
      )}

      {/* Tab Content 1: Inventory Assets Grid & Cards */}
      {activeTab === 'inventory' && (
        <>
          {filteredAssets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">কোনো উপকরণ খুঁজে পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো উপকরণ নেই। অনুগ্রহ করে অন্য ফিল্টার দিয়ে চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedCondition('all');
                  setOnlyLowStockFilter(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                সব ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssets.map((asset) => {
                const catMeta = CATEGORY_LABELS[asset.category] || CATEGORY_LABELS.montessori_toys;
                const condMeta = CONDITION_LABELS[asset.condition] || CONDITION_LABELS.good;
                const threshold = asset.lowStockThreshold ?? 2;
                const isLowStock = asset.availableQuantity <= threshold;
                const isOutOfStock = asset.availableQuantity <= 0;

                const percentAvailable =
                  asset.totalQuantity > 0
                    ? Math.round((asset.availableQuantity / asset.totalQuantity) * 100)
                    : 0;

                const activeBorrowsForThis =
                  asset.activeUsages?.filter((u) => u.status === 'active_borrowed') || [];

                return (
                  <div
                    key={asset.id}
                    className={`bg-white rounded-3xl transition-all flex flex-col justify-between overflow-hidden group ${
                      isLowStock
                        ? 'border-2 border-rose-500 shadow-md shadow-rose-100/60 ring-2 ring-rose-200/50 bg-rose-50/20'
                        : 'border border-slate-200 shadow-2xs hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* RED LOW-STOCK ALERT HEADER RIBBON */}
                      {isLowStock && (
                        <div className="bg-rose-600 text-white px-3.5 py-1.5 flex items-center justify-between text-xs font-bold shadow-xs">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
                            <span>
                              {isOutOfStock ? '🚨 স্টক শেষ (Out of Stock)' : '⚠️ লো-স্টক সতর্কবার্তা (Low Stock)'}
                            </span>
                          </div>
                          <span className="text-[11px] bg-black/25 px-2 py-0.5 rounded font-mono font-bold">
                            মজুত: {asset.availableQuantity} / সীমা: {threshold}
                          </span>
                        </div>
                      )}

                      {/* Card Header & Photo */}
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={asset.photoUrl || '/assets/fb/photo-1.jpg'}
                          alt={asset.nameBn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wide">
                            {asset.assetCode}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md ${catMeta.bg} ${catMeta.color}`}
                          >
                            {asset.categoryBn}
                          </span>
                        </div>

                        {/* Bottom Title on Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-base font-black line-clamp-1">{asset.nameBn}</h3>
                          <p className="text-[11px] text-slate-300 font-mono line-clamp-1">
                            {asset.nameEn}
                          </p>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-5 space-y-4">
                        {/* Location & In-charge */}
                        <div className="space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="line-clamp-1">{asset.locationRoomBn}</span>
                          </div>
                          {asset.assignedTeacherNameBn && (
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="line-clamp-1">
                                তত্ত্বাবধায়ক: <strong>{asset.assignedTeacherNameBn}</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stock Progress Bar (RED if low stock) */}
                        <div
                          className={`space-y-1.5 p-3 rounded-2xl border ${
                            isLowStock
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`font-semibold ${
                                isLowStock ? 'text-rose-800' : 'text-slate-500'
                              }`}
                            >
                              {isLowStock ? '🚨 স্টক সংকট সীমা:' : 'স্টক অবস্থা:'}
                            </span>
                            <div className="font-mono">
                              <span
                                className={`font-bold ${
                                  isLowStock ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                              >
                                {asset.availableQuantity}
                              </span>{' '}
                              / <span className="text-slate-600">{asset.totalQuantity}</span>{' '}
                              <span className="text-[11px] text-slate-400">{asset.unitBn}</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isLowStock ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${percentAvailable}%` }}
                            />
                            <div
                              className="bg-indigo-500 h-full transition-all"
                              style={{ width: `${100 - percentAvailable}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span
                              className={`font-bold ${
                                isLowStock ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              মজুত: {asset.availableQuantity} {asset.unitBn}{' '}
                              {isLowStock && `(সীমা: ${threshold})`}
                            </span>
                            <span className="text-indigo-700 font-bold">
                              ইস্যুকৃত: {asset.inUseQuantity} {asset.unitBn}
                            </span>
                          </div>
                        </div>

                        {/* Condition Badge and Low Stock Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${condMeta.bg} ${condMeta.color}`}
                            >
                              {condMeta.labelBn}
                            </span>
                            {isLowStock && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                সীমা: {threshold} {asset.unitBn}
                              </span>
                            )}
                          </div>
                          {asset.costEstimateBdt && (
                            <span className="font-mono text-slate-600 font-bold text-[11px]">
                              ৳ {asset.costEstimateBdt.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {asset.maintenanceNoteBn && (
                          <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100/60 line-clamp-2">
                            💡 {asset.maintenanceNoteBn}
                          </p>
                        )}

                        {/* Current Borrows Badge */}
                        {activeBorrowsForThis.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-600" />
                                চলমান ব্যবহার ({activeBorrowsForThis.length} টি)
                              </span>
                            </div>
                            {activeBorrowsForThis.slice(0, 1).map((ub) => (
                              <div
                                key={ub.id}
                                className="text-[11px] flex items-center justify-between"
                              >
                                <span>
                                  {ub.checkedOutByTeacherNameBn} ({ub.className})
                                </span>
                                <span className="font-mono font-bold">
                                  {ub.quantityBorrowed} {asset.unitBn}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="বিস্তারিত ও ব্যবহারের ইতিহাস দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Low stock alert sender button */}
                        {isLowStock && (
                          <button
                            type="button"
                            onClick={() => handleTriggerManualAlert(asset)}
                            className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition cursor-pointer"
                            title="অ্যাডমিনকে পুশ নোটিফিকেশন অ্যালার্ট পাঠান"
                          >
                            <BellRing className="w-4 h-4" />
                          </button>
                        )}

                        {canManageAssets && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(asset)}
                              className="p-2 rounded-xl text-amber-700 hover:text-amber-900 hover:bg-amber-50 transition cursor-pointer"
                              title="সম্পাদনা / স্টক রিফিল করুন"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                              title="উপকরণটি মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Checkout Button */}
                      <button
                        type="button"
                        disabled={asset.availableQuantity <= 0}
                        onClick={() => handleOpenCheckoutModal(asset)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          asset.availableQuantity > 0
                            ? isLowStock
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-amber-700 hover:bg-amber-800 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'স্টক শেষ' : 'ইস্যু করুন'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab Content 2: Active Checkouts Register */}
      {activeTab === 'checkouts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  ইস্যুকৃত সামগ্রী ও ক্লাসরুম রিকুইজিশন রেজিস্টার
                </h3>
                <p className="text-xs text-slate-500">
                  কোন শিক্ষক কোন ক্লাসে কতগুলো উপকরণ নিয়েছেন এবং ফেরত দেওয়া হয়েছে কিনা তার রিয়েল-টাইম লগ।
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 font-mono">
                মোট রেকর্ড: {allActiveCheckouts.length}
              </span>
            </div>

            {allActiveCheckouts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                কোনো চেক-আউট বা রিকুইজিশন রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">উপকরণ ও কোড</th>
                      <th className="py-3 px-4">শিক্ষক ও শ্রেণি</th>
                      <th className="py-3 px-4">পরিমাণ</th>
                      <th className="py-3 px-4">উদ্দেশ্য / কারণ</th>
                      <th className="py-3 px-4">ইস্যুর সময়</th>
                      <th className="py-3 px-4">ফেরত তারিখ / অবস্থা</th>
                      <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allActiveCheckouts.map((usage) => {
                      const isBorrowed = usage.status === 'active_borrowed';
                      const parentAsset = assets.find((a) => a.id === usage.assetId);

                      return (
                        <tr
                          key={usage.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isBorrowed ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{usage.assetNameBn}</div>
                            {parentAsset && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {parentAsset.assetCode} ({parentAsset.locationRoomBn})
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">
                              {usage.checkedOutByTeacherNameBn}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">
                              শ্রেণি: {usage.className || 'স্কুলব্যাপী'}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {usage.quantityBorrowed} {parentAsset?.unitBn || 'টি'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs">
                            <div className="line-clamp-2">{usage.purposeBn}</div>
                            {usage.remarksBn && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">
                                {usage.remarksBn}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            <div>{usage.borrowDateBn}</div>
                            <div className="text-[10px] text-slate-400">{usage.borrowTimeBn}</div>
                          </td>
                          <td className="py-3 px-4">
                            {isBorrowed ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  ক্লাসরুমে ব্যবহৃত
                                </span>
                                {usage.expectedReturnDateBn && (
                                  <div className="text-[10px] text-slate-500">
                                    সম্ভাব্য ফেরত: {usage.expectedReturnDateBn}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  ফেরত গৃহীত
                                </span>
                                {usage.returnedDateBn && (
                                  <div className="text-[10px] text-slate-500">
                                    {usage.returnedDateBn}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isBorrowed && (
                              <button
                                type="button"
                                onClick={() => handleReturnItem(usage.assetId, usage.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>ফেরত নিন</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: Quick Check-out / Issue Asset Modal */}
      {/* ========================================================= */}
      {isCheckoutModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase">
                  দ্রুত ইস্যু / রিকুইজিশন
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedAsset.nameBn}
                </h3>
                <p className="text-xs text-slate-500">
                  বর্তমান মজুত: <strong>{selectedAsset.availableQuantity} {selectedAsset.unitBn}</strong> · লোকেশন: {selectedAsset.locationRoomBn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckout} className="space-y-4 text-xs">
              {/* Teacher select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">গ্রহণকারী শিক্ষক / স্টাফ</label>
                <select
                  value={checkoutTeacher}
                  onChange={(e) => setCheckoutTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {SCHOOL_TEACHERS.map((tch) => (
                    <option key={tch.id} value={tch.nameBn}>
                      {tch.nameBn} ({tch.designationBn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Class and Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">শ্রেণিকক্ষ (Class)</label>
                  <select
                    value={checkoutClass}
                    onChange={(e) => setCheckoutClass(e.target.value as SchoolClass)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {SCHOOL_CLASSES_LIST.map((cls: SchoolClass) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    ইস্যু পরিমাণ (সর্বোচ্চ {selectedAsset.availableQuantity} {selectedAsset.unitBn})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedAsset.availableQuantity}
                    value={checkoutQuantity}
                    onChange={(e) => setCheckoutQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ব্যবহারের উদ্দেশ্য / সেশন</label>
                <input
                  type="text"
                  value={checkoutPurpose}
                  onChange={(e) => setCheckoutPurpose(e.target.value)}
                  placeholder="যেমন: প্লে-গ্রুপের বর্ণমালা মেলানো ও ক্রাফট সেশন"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  required
                />
              </div>

              {/* Expected Return Date/Time */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">সম্ভাব্য ফেরত সময়</label>
                <input
                  type="text"
                  value={checkoutReturnDate}
                  onChange={(e) => setCheckoutReturnDate(e.target.value)}
                  placeholder="যেমন: আজ দুপুর ১২:৩০ বা আগামী রবিবার"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black cursor-pointer shadow-md"
                >
                  ইস্যু নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Add / Edit Asset Modal */}
      {/* ========================================================= */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isAddModalOpen ? '+ নতুন স্কুল উপকরণ / অ্যাসেট যোগ' : 'উপকরণ তথ্য ও স্টক আপডেট'}
                </h3>
                <p className="text-xs text-slate-500">
                  উপকরণের সঠিক নাম, ক্যাটাগরি, অবস্থান, স্টক ও লো-স্টক সীমা নির্ধারণ করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={isAddModalOpen ? handleSaveNewAsset : handleSaveEditedAsset}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">অ্যাসেট কোড (Code)</label>
                  <input
                    type="text"
                    value={formAssetCode}
                    onChange={(e) => setFormAssetCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ক্যাটাগরি</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AssetCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map((cKey) => (
                      <option key={cKey} value={cKey}>
                        {CATEGORY_LABELS[cKey].labelBn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">উপকরণের নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    placeholder="যেমন: মন্টেসরি রঙের প্যাটার্ন পাজল"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ইংরেজি নাম (English)</label>
                  <input
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Montessori Color Pattern Puzzle"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">মোট পরিমাণ</label>
                  <input
                    type="number"
                    min={1}
                    value={formTotalQty}
                    onChange={(e) => setFormTotalQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">একক (Unit)</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="যেমন: টি, সেট, বক্স"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">অবস্থা (Condition)</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="excellent">চমৎকার (নতুন)</option>
                    <option value="good">ভালো অবস্থা</option>
                    <option value="needs_repair">মেরামত প্রয়োজন</option>
                    <option value="damaged">ত্রুটিযুক্ত / বাদ</option>
                  </select>
                </div>
              </div>

              {/* LOW STOCK THRESHOLD INPUT (REQUESTED FEATURE) */}
              <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 space-y-1">
                <label className="font-bold text-rose-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    লো-স্টক সতর্কবার্তা সীমা (Low Stock Threshold)
                  </span>
                  <span className="text-[10px] bg-rose-200/80 px-2 py-0.5 rounded text-rose-900">
                    অটো-অ্যালার্ট
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={formTotalQty}
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-xl border border-rose-300 bg-white font-mono font-bold text-rose-700"
                    required
                  />
                  <span className="text-[11px] text-rose-800">
                    মজুত এই পরিমাণের নিচে নামলেই কার্ড লাল হবে ও অ্যাডমিনকে পুশ অ্যালার্ট পাঠানো হবে।
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">লোকেশন / রুম</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="যেমন: মন্টেসরি ল্যাব, শিক্ষক লাউঞ্জ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">আনুমানিক মূল্য (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">দায়িত্বপ্রাপ্ত শিক্ষক / তত্ত্বাবধায়ক</label>
                <select
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {SCHOOL_TEACHERS.map((tch) => (
                    <option key={tch.id} value={tch.nameBn}>
                      {tch.nameBn} ({tch.designationBn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ছবি নির্বাচন / ইউআরএল</label>
                <div className="flex gap-2 items-center">
                  <select
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="/assets/fb/photo-1.jpg">ছবি ১: মন্টেসরি কাঠের ব্লক</option>
                    <option value="/assets/fb/photo-2.jpg">ছবি ২: আর্ট ও চিত্রাঙ্কন ক্লাস</option>
                    <option value="/assets/fb/photo-3.jpg">ছবি ৩: ছড়া ও গান সেশন</option>
                    <option value="/assets/fb/photo-4.jpg">ছবি ৪: ক্লাসরুম ড্রয়িং উপকরণ</option>
                    <option value="/assets/fb/photo-5.jpg">ছবি ৫: খেলাধুলা ও ফিটনেস</option>
                    <option value="/assets/fb/photo-6.jpg">ছবি ৬: প্রাথমিক চিকিৎসা কিট</option>
                  </select>
                  <img
                    src={formPhotoUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-lg object-cover border border-slate-300 shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">রক্ষণাবেক্ষণ ও ব্যবহার সংক্রান্ত নোট</label>
                <textarea
                  rows={2}
                  value={formMaintenance}
                  onChange={(e) => setFormMaintenance(e.target.value)}
                  placeholder="যেমন: ব্যবহারের পর ডেটল স্প্রে করা আবশ্যক।"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black cursor-pointer shadow-md"
                >
                  {isAddModalOpen ? 'উপকরণ সংরক্ষণ করুন' : 'আপডেট সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Asset Details & Usage History Modal */}
      {/* ========================================================= */}
      {isDetailsModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex gap-4">
                <img
                  src={selectedAsset.photoUrl || '/assets/fb/photo-1.jpg'}
                  alt={selectedAsset.nameBn}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-600">
                    {selectedAsset.assetCode}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedAsset.nameBn}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedAsset.nameEn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block">ক্যাটাগরি:</span>
                <span className="font-bold text-slate-800">{selectedAsset.categoryBn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">অবস্থান:</span>
                <span className="font-bold text-slate-800">{selectedAsset.locationRoomBn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">মোট ও মজুত:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedAsset.availableQuantity} / {selectedAsset.totalQuantity} {selectedAsset.unitBn}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">লো-স্টক সীমা:</span>
                <span className="font-bold text-rose-700 font-mono">
                  {selectedAsset.lowStockThreshold ?? 2} {selectedAsset.unitBn}
                </span>
              </div>
            </div>

            {selectedAsset.maintenanceNoteBn && (
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block mb-0.5">📌 রক্ষণাবেক্ষণ নোট:</span>
                <p>{selectedAsset.maintenanceNoteBn}</p>
              </div>
            )}

            {/* Usage History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>ক্লাসরুম ব্যবহারের সাম্প্রতিক ইতিহাস (Usage Logs)</span>
              </h4>

              {!selectedAsset.activeUsages || selectedAsset.activeUsages.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                  এখনো কোনো ব্যবহারের রেকর্ড নেই।
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto border border-slate-100 rounded-2xl">
                  {selectedAsset.activeUsages.map((usage) => (
                    <div
                      key={usage.id}
                      className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {usage.checkedOutByTeacherNameBn}{' '}
                          <span className="text-slate-500 font-normal">
                            ({usage.className || 'স্কুল'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{usage.purposeBn}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ইস্যু: {usage.borrowDateBn}, {usage.borrowTimeBn}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-slate-800 block">
                          {usage.quantityBorrowed} {selectedAsset.unitBn}
                        </span>
                        {usage.status === 'active_borrowed' ? (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            ব্যবহারাধীন
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ফেরত সম্পন্ন ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenCheckoutModal(selectedAsset);
                }}
                disabled={selectedAsset.availableQuantity <= 0}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                + এই উপকরণটি ইস্যু করুন
              </button>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
