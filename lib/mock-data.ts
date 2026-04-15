export type User = {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type ProjectStatus = 'active' | 'inactive' | 'archived'

export type Project = {
  id: string
  name: string
  userId: string
  status: ProjectStatus
  createdAt: string
}

export type AcquirerStatus = 'verified' | 'pending' | 'disabled'

export type Acquirer = {
  id: string
  name: string
  code: string
  status: AcquirerStatus
  createdAt: string
}

export type SubmerchantStatus = 'verified' | 'pending' | 'disabled'

export type Submerchant = {
  id: string
  name: string
  merchantId: string
  status: SubmerchantStatus
  acquirerCode: string | null
  createdAt: string
}

export type ProjectAssignmentItem = {
  acquirerId: string
  submerchantIds: string[]
}

export type ProjectAssignment = {
  projectId: string
  assignments: ProjectAssignmentItem[]
}

export const users: User[] = [
  {
    id: '1',
    name: 'Ahmad Rizky',
    email: 'ahmad@kesh.co.id',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti@kesh.co.id',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@kesh.co.id',
    status: 'active',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Dewi Wijaya',
    email: 'dewi@kesh.co.id',
    status: 'inactive',
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    name: 'Eka Putri',
    email: 'eka@kesh.co.id',
    status: 'active',
    createdAt: '2024-02-01',
  },
]

export const projects: Project[] = [
  {
    id: 'prj-001',
    name: 'Integration Platform v2',
    userId: '1',
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: 'prj-002',
    name: 'Payment Gateway Enhancement',
    userId: '2',
    status: 'active',
    createdAt: '2024-02-15',
  },
  {
    id: 'prj-003',
    name: 'Risk Management System',
    userId: '3',
    status: 'inactive',
    createdAt: '2023-11-20',
  },
]

export const acquirers: Acquirer[] = [
  {
    id: 'acq-001',
    name: 'Bank Central Asia',
    code: 'BCA',
    status: 'verified',
    createdAt: '2023-12-01',
  },
  {
    id: 'acq-002',
    name: 'Bank Mandiri',
    code: 'MANDIRI',
    status: 'verified',
    createdAt: '2023-12-05',
  },
  {
    id: 'acq-003',
    name: 'Bank Rakyat Indonesia',
    code: 'BRI',
    status: 'verified',
    createdAt: '2023-12-10',
  },
  {
    id: 'acq-004',
    name: 'Bank Negara Indonesia',
    code: 'BNI',
    status: 'pending',
    createdAt: '2024-02-01',
  },
]

export const submerchants: Submerchant[] = [
  {
    id: 'sub-001',
    name: 'PT Toko Online Jaya',
    merchantId: 'TOKO-001',
    status: 'verified',
    acquirerCode: 'BCA',
    createdAt: '2024-01-05',
  },
  {
    id: 'sub-002',
    name: 'CV Restoran Maju Jaya',
    merchantId: 'REST-001',
    status: 'verified',
    acquirerCode: 'BCA',
    createdAt: '2024-01-10',
  },
  {
    id: 'sub-003',
    name: 'PT Fashion Hub Indonesia',
    merchantId: 'FASH-001',
    status: 'verified',
    acquirerCode: 'MANDIRI',
    createdAt: '2024-01-15',
  },
  {
    id: 'sub-004',
    name: 'Warung Kopi Digital',
    merchantId: 'KOPI-001',
    status: 'pending',
    acquirerCode: 'BNI',
    createdAt: '2024-02-20',
  },
  {
    id: 'sub-005',
    name: 'Toko Elektronik Pasifik',
    merchantId: 'ELEC-001',
    status: 'verified',
    acquirerCode: 'BRI',
    createdAt: '2024-01-20',
  },
  {
    id: 'sub-006',
    name: 'PT Logistik Express',
    merchantId: 'LOG-001',
    status: 'disabled',
    acquirerCode: 'BCA',
    createdAt: '2023-12-01',
  },
]

export const projectAssignments: ProjectAssignment[] = [
  {
    projectId: 'prj-001',
    assignments: [
      {
        acquirerId: 'acq-001',
        submerchantIds: ['sub-001', 'sub-002'],
      },
      {
        acquirerId: 'acq-002',
        submerchantIds: ['sub-003'],
      },
    ],
  },
  {
    projectId: 'prj-002',
    assignments: [
      {
        acquirerId: 'acq-003',
        submerchantIds: ['sub-005'],
      },
      {
        acquirerId: 'acq-004',
        submerchantIds: ['sub-004'],
      },
    ],
  },
  {
    projectId: 'prj-003',
    assignments: [
      {
        acquirerId: 'acq-001',
        submerchantIds: ['sub-006'],
      },
    ],
  },
]