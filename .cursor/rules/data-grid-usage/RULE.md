---
description: 'Pattern สำหรับใช้ DataGrid และ react-table (ถ้าต้องการ)'
globs:
  - '**/tables/**/*.tsx'
  - '**/*-table.tsx'
  - '**/*-list.tsx'
alwaysApply: false
---

# DataGrid & React Table Pattern

> **Note**: โปรเจคนี้เป็น Mobile App เป็นหลัก จึงอาจไม่ค่อยใช้ DataGrid มากนัก
> แต่ถ้าต้องการแสดงข้อมูลแบบตาราง สามารถใช้ pattern นี้ได้

## โครงสร้างพื้นฐาน

```tsx
'use client'

import { useMemo, useState } from 'react'

import { useGetEntityList } from '@src/features/[feature]/hooks'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardFooter } from '@src/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/shared/ui/table'
import {
  ColumnDef,
  PaginationState,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

interface EntityData {
  id: string
  name: string
  status: string
}

export function EntityListTable() {
  // 1. State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ])

  // 2. Fetch data
  const { data: apiResponse, isLoading } = useGetEntityList({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  // 3. Transform data
  const data = useMemo(() => {
    if (!apiResponse?.data) return []
    return apiResponse.data
  }, [apiResponse])

  // 4. Define columns
  const columns = useMemo<ColumnDef<EntityData>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: 'ชื่อ',
        cell: (info) => info.getValue(),
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: 'สถานะ',
        cell: (info) => {
          const status = info.getValue() as string
          return status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'
        },
      },
    ],
    []
  )

  // 5. Create table instance
  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((apiResponse?.meta?.total || 0) / pagination.pageSize),
  })

  if (isLoading) {
    return <div>กำลังโหลด...</div>
  }

  // 6. Render
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          ก่อนหน้า
        </Button>
        <span>
          หน้า {pagination.pageIndex + 1} จาก {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          ถัดไป
        </Button>
      </CardFooter>
    </Card>
  )
}
```

## Mobile-Friendly List Pattern

สำหรับ Mobile App ควรใช้ Card List แทน Table:

```tsx
'use client'

import { useGetLoansByAgentId } from '@src/features/loan/hooks'
import { Badge } from '@src/shared/ui/badge'
import { Card } from '@src/shared/ui/card'
import { Skeleton } from '@src/shared/ui/skeleton'

export function LoansList({ agentId }: { agentId: string }) {
  const { data, isLoading } = useGetLoansByAgentId(agentId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (!data?.data?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">ไม่พบรายการ</div>
    )
  }

  return (
    <div className="space-y-4">
      {data.data.map((loan) => (
        <Card key={loan.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{loan.customerName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(loan.requestedAmount)}
              </p>
            </div>
            <Badge variant={getStatusVariant(loan.status)}>
              {getStatusLabel(loan.status)}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

## Status Badge Helpers

```tsx
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'success'
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return 'warning'
    case 'REJECTED':
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    DRAFT: 'แบบร่าง',
    SUBMITTED: 'ส่งแล้ว',
    UNDER_REVIEW: 'กำลังพิจารณา',
    APPROVED: 'อนุมัติ',
    REJECTED: 'ไม่อนุมัติ',
    CANCELLED: 'ยกเลิก',
  }
  return labels[status] || status
}
```

## Currency Formatting

```tsx
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount)
}
```
