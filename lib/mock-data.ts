export type User = {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type Project = {
  id: string
  name: string
  status: 'active' | 'inactive' | 'archived'
  acquirers: number
  submerchants: number
  createdAt: string
}

export type Acquirer = {
  id: string
  name: string
  code: string
  status: 'verified' | 'pending' | 'disabled'
  assignedSubmerchants: number
  createdAt: string
}

export type Submerchant = {
  id: string
  name: string
  merchantId: string
  status: 'verified' | 'pending' | 'disabled'
  acquirers: string[]
  createdAt: string
}

export const users: User[] = [
  {
    id: '1',
    name: 'Ahmad Rizky',
    email: 'ahmad@kesh.co.id',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti@kesh.co.id',
    role: 'Manager',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@kesh.co.id',
    role: 'Operator',
    status: 'active',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Dewi Wijaya',
    email: 'dewi@kesh.co.id',
    role: 'Analyst',
    status: 'inactive',
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    name: 'Eka Putri',
    email: 'eka@kesh.co.id',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-02-01',
  },
]

export const projects: Project[] = [
  {
    id: 'prj-001',
    name: 'Integration Platform v2',
    status: 'active',
    acquirers: 5,
    submerchants: 142,
    createdAt: '2024-01-10',
  },
  {
    id: 'prj-002',
    name: 'Payment Gateway Enhancement',
    status: 'active',
    acquirers: 3,
    submerchants: 87,
    createdAt: '2024-02-15',
  },
  {
    id: 'prj-003',
    name: 'Risk Management System',
    status: 'inactive',
    acquirers: 2,
    submerchants: 45,
    createdAt: '2023-11-20',
  },
  {
    id: 'prj-004',
    name: 'Settlement Automation',
    status: 'active',
    acquirers: 4,
    submerchants: 156,
    createdAt: '2024-01-05',
  },
  {
    id: 'prj-005',
    name: 'Legacy System Migration',
    status: 'archived',
    acquirers: 1,
    submerchants: 23,
    createdAt: '2023-09-01',
  },
]

export const acquirers: Acquirer[] = [
  {
    id: 'acq-001',
    name: 'Bank Central Asia',
    code: 'BCA',
    status: 'verified',
    assignedSubmerchants: 234,
    createdAt: '2023-12-01',
  },
  {
    id: 'acq-002',
    name: 'Bank Mandiri',
    code: 'MANDIRI',
    status: 'verified',
    assignedSubmerchants: 189,
    createdAt: '2023-12-05',
  },
  {
    id: 'acq-003',
    name: 'Bank Rakyat Indonesia',
    code: 'BRI',
    status: 'verified',
    assignedSubmerchants: 156,
    createdAt: '2023-12-10',
  },
  {
    id: 'acq-004',
    name: 'Bank Negara Indonesia',
    code: 'BNI',
    status: 'pending',
    assignedSubmerchants: 0,
    createdAt: '2024-02-01',
  },
  {
    id: 'acq-005',
    name: 'CIMB Niaga',
    code: 'CIMB',
    status: 'disabled',
    assignedSubmerchants: 0,
    createdAt: '2023-11-15',
  },
  {
    id: 'acq-006',
    name: 'Bank DBS Indonesia',
    code: 'DBS',
    status: 'verified',
    assignedSubmerchants: 98,
    createdAt: '2024-01-20',
  },
]

export const submerchants: Submerchant[] = [
  {
    id: 'sub-001',
    name: 'PT Toko Online Jaya',
    merchantId: 'TOKO-001',
    status: 'verified',
    acquirers: ['BCA', 'MANDIRI'],
    createdAt: '2024-01-05',
  },
  {
    id: 'sub-002',
    name: 'CV Restoran Maju Jaya',
    merchantId: 'REST-001',
    status: 'verified',
    acquirers: ['BCA', 'BRI'],
    createdAt: '2024-01-10',
  },
  {
    id: 'sub-003',
    name: 'PT Fashion Hub Indonesia',
    merchantId: 'FASH-001',
    status: 'verified',
    acquirers: ['MANDIRI'],
    createdAt: '2024-01-15',
  },
  {
    id: 'sub-004',
    name: 'Warung Kopi Digital',
    merchantId: 'KOPI-001',
    status: 'pending',
    acquirers: [],
    createdAt: '2024-02-20',
  },
  {
    id: 'sub-005',
    name: 'Toko Elektronik Pasifik',
    merchantId: 'ELEC-001',
    status: 'verified',
    acquirers: ['BCA', 'MANDIRI', 'BRI'],
    createdAt: '2024-01-20',
  },
  {
    id: 'sub-006',
    name: 'PT Logistik Express',
    merchantId: 'LOG-001',
    status: 'disabled',
    acquirers: ['BCA'],
    createdAt: '2023-12-01',
  },
]
