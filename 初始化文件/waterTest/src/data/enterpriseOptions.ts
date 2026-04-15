import type { Enterprise, EnterpriseType } from '../types';

export const ENTERPRISE_TYPE_LABEL: Record<EnterpriseType, string> = {
  'water-company': '水务公司',
  'meter-factory': '水表厂',
};

export const ENTERPRISE_OPTIONS: Enterprise[] = [
  {
    id: '1',
    name: '智慧水务有限公司',
    code: 'ENT-001',
    type: 'water-company',
    adminName: '张总',
    adminUsername: 'admin_zhsw',
    adminPassword: '••••••',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: '工业仪表制造厂',
    code: 'ENT-002',
    type: 'meter-factory',
    adminName: '李厂长',
    adminUsername: 'admin_gyyb',
    adminPassword: '••••••',
    status: 'active',
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    name: '清源供水有限公司',
    code: 'ENT-003',
    type: 'water-company',
    adminName: '王总',
    adminUsername: 'admin_qysw',
    adminPassword: '••••••',
    status: 'active',
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    name: '城东制表厂',
    code: 'ENT-004',
    type: 'meter-factory',
    adminName: '周厂长',
    adminUsername: 'admin_cdzb',
    adminPassword: '••••••',
    status: 'active',
    createdAt: '2024-03-08',
  },
];

export const WATER_COMPANY_OPTIONS = ENTERPRISE_OPTIONS.filter((item) => item.type === 'water-company');

export const WATER_PLANT_OPTIONS = ENTERPRISE_OPTIONS.filter((item) => item.type === 'meter-factory');
