import { describe, test, expect } from 'bun:test';
import {
  getAllStaffChatMembers,
  getStaffMemberIdentity,
  canUserAccessChannel,
  canUserEditChat,
  DEFAULT_STAFF_CHANNELS,
  createStaffChannel,
  updateStaffChannel,
  deleteStaffChannel,
  getStoredStaffChannels,
} from './staffChatLogic';
import { PortalAccount, StaffChannelMeta } from '../types/school';

describe('Staff and Parent Chat Logic Tests', () => {
  test('getAllStaffChatMembers includes directors, teachers, and parents', () => {
    const members = getAllStaffChatMembers();
    expect(members.length).toBeGreaterThan(15);

    // Verify parents are included
    const parentMembers = members.filter((m) => m.category === 'parent');
    expect(parentMembers.length).toBeGreaterThan(0);

    // Verify demo parent std-1 (Subrata Roy / Aditya Roy's father)
    const adityaParent = parentMembers.find((m) => m.studentId === 'std-1' || m.id === 'std-1');
    expect(adityaParent).toBeDefined();
    expect(adityaParent?.nameBn).toContain('সুব্রত');
    expect(adityaParent?.role).toBe('parent');
    expect(adityaParent?.category).toBe('parent');
    expect(adityaParent?.designationBn).toContain('আদিত্য রায়');
  });

  test('getStaffMemberIdentity accurately identifies parent accounts', () => {
    const parentAccount: PortalAccount = {
      id: 'acc-parent',
      nameBn: 'সুব্রত রায়',
      nameEn: 'Subrata Roy',
      role: 'parent',
      roleTitleBn: 'অভিভাবক (আদিত্য রায়)',
      portalNameBn: 'অভিভাবক পোর্টাল',
      email: 'parent@anandapathshala.edu.bd',
      phone: '01711223399',
      username: 'parent',
      studentId: 'std-1',
    };

    const identity = getStaffMemberIdentity('parent', parentAccount);
    expect(identity.category).toBe('parent');
    expect(identity.studentId).toBe('std-1');
    expect(identity.nameBn).toContain('সুব্রত');
  });

  test('canUserAccessChannel allows parents in authorized groups and blocks from directors board', () => {
    const ptaChannel: StaffChannelMeta = {
      id: 'pta_parents_forum',
      titleBn: 'অভিভাবক ও শিক্ষক প্রতিনিধি ফোরাম',
      subtitleBn: 'সমন্বয় ফোরাম',
      memberIds: ['tch-1', 'std-1', 'dir-4'],
      allowedRoles: ['director', 'principal', 'teacher', 'parent'],
    };

    const directorsChannel: StaffChannelMeta = {
      id: 'directors_board',
      titleBn: 'পরিচালনা পর্ষদ ফোরাম',
      subtitleBn: 'বোর্ড রুম',
      memberIds: ['dir-4', 'dir-3', 'tch-1'],
    };

    const staffChannel: StaffChannelMeta = {
      id: 'all_staff',
      titleBn: 'সকল স্টাফ ফোরাম',
      subtitleBn: 'কমনরুম',
      memberIds: ['tch-1', 'tch-2', 'dir-4'],
    };

    // Parent std-1 should access PTA because they are in memberIds
    expect(canUserAccessChannel(ptaChannel, 'parent', 'std-1')).toBe(true);

    // Another parent std-2 not in ptaChannel memberIds should be blocked
    expect(canUserAccessChannel(ptaChannel, 'parent', 'std-2')).toBe(false);

    // Parent should never access directors board or all staff
    expect(canUserAccessChannel(directorsChannel, 'parent', 'std-1')).toBe(false);
    expect(canUserAccessChannel(staffChannel, 'parent', 'std-1')).toBe(false);

    // Principal should have supervisor access to all channels
    expect(canUserAccessChannel(ptaChannel, 'principal', 'tch-1')).toBe(true);
    expect(canUserAccessChannel(directorsChannel, 'principal', 'tch-1')).toBe(true);
    expect(canUserAccessChannel(staffChannel, 'principal', 'tch-1')).toBe(true);
  });

  test('canUserEditChat strictly limits edit privileges to Principal and Super Admin', () => {
    expect(canUserEditChat('super_admin')).toBe(true);
    expect(canUserEditChat('principal')).toBe(true);
    expect(canUserEditChat('teacher')).toBe(false);
    expect(canUserEditChat('parent')).toBe(false);
    expect(canUserEditChat('director')).toBe(false);
    expect(canUserEditChat('accountant')).toBe(false);
  });

  test('DEFAULT_STAFF_CHANNELS contains pta_parents_forum with parent members', () => {
    const pta = DEFAULT_STAFF_CHANNELS.find((c) => c.id === 'pta_parents_forum');
    expect(pta).toBeDefined();
    expect(pta?.allowedRoles).toContain('parent');
    expect(pta?.memberIds).toContain('std-1');
  });
});
