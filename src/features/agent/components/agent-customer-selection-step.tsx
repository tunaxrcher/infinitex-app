'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import {
  useCreateCustomer,
  useGetCustomerListByAgent,
} from '@src/features/customer/hooks'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Loader2, Phone, Plus, Search, User } from 'lucide-react'

interface AgentCustomerSelectionStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

export function AgentCustomerSelectionStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isFirstStep,
}: AgentCustomerSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(
    data.customerId || null
  )
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerName, setNewCustomerName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch customers for current agent
  const {
    data: customers = [],
    isLoading,
    error,
  } = useGetCustomerListByAgent({
    search: searchTerm.length >= 2 ? searchTerm : undefined,
  })

  // Create customer mutation
  const createCustomerMutation = useCreateCustomer()

  const filteredCustomers = customers

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer.id)
    onUpdate({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phoneNumber,
    })
  }

  const handleNewCustomer = async () => {
    if (newCustomerName.trim() && newCustomerPhone.trim()) {
      try {
        // Split name into first and last name
        const nameParts = newCustomerName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || undefined // ใช้ undefined แทน empty string

        // Clean phone number (remove dashes)
        const cleanPhone = newCustomerPhone.replace(/-/g, '')

        const customerData: any = {
          phoneNumber: cleanPhone,
          firstName,
        }

        // เพิ่ม lastName เฉพาะเมื่อมีค่า
        if (lastName) {
          customerData.lastName = lastName
        }

        const newCustomer =
          await createCustomerMutation.mutateAsync(customerData)

        setSelectedCustomer(newCustomer.id)
        onUpdate({
          customerId: newCustomer.id,
          customerName: newCustomerName.trim(),
          customerPhone: newCustomerPhone,
        })
        setShowNewCustomerForm(false)
        setNewCustomerName('')
        setNewCustomerPhone('')
      } catch (error) {
        // Error จะถูกจัดการโดย useCreateCustomer hook แล้ว
        console.error('Component caught error:', error)
      }
    }
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.slice(0, 10)

    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`
    }
    return limited
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setNewCustomerPhone(formatted)
  }

  const canProceed = selectedCustomer !== null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            เลือกลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อหรือเบอร์โทรศัพท์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                กำลังโหลดข้อมูลลูกค้า...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า
              </p>
            </div>
          )}

          {/* Existing Customers */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {/* Customer count info */}
              {filteredCustomers.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  พบ {filteredCustomers.length} ลูกค้า
                  {searchTerm && ` (แสดง ${paginatedCustomers.length} รายการ)`}
                </p>
              )}

              {/* Customer list */}
              <div className="space-y-2">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm.length >= 2
                      ? 'ไม่พบลูกค้าที่ค้นหา'
                      : 'ยังไม่มีลูกค้า'}
                  </div>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCustomer === customer.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectCustomer(customer)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phoneNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            สินเชื่อ: {customer.loanCount} รายการ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    แสดง {startIndex + 1}-
                    {Math.min(endIndex, filteredCustomers.length)} จาก{' '}
                    {filteredCustomers.length} รายการ
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}>
                      ก่อนหน้า
                    </Button>
                    <span className="text-sm font-medium">
                      หน้า {currentPage} จาก {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}>
                      ถัดไป
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add New Customer */}
          {!showNewCustomerForm ? (
            <Button
              variant="outline"
              onClick={() => setShowNewCustomerForm(true)}
              className="w-full border-dashed bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มลูกค้าใหม่
            </Button>
          ) : (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="px-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  เพิ่มลูกค้าใหม่
                </h4>
                <div className="space-y-3">
                  <Input
                    placeholder="ชื่อ-นามสกุล"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder="เบอร์โทรศัพท์ (08X-XXX-XXXX)"
                    value={newCustomerPhone}
                    onChange={handlePhoneChange}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleNewCustomer}
                      disabled={
                        !newCustomerName.trim() ||
                        !newCustomerPhone.trim() ||
                        createCustomerMutation.isPending
                      }
                      className="flex-1">
                      {createCustomerMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          กำลังเพิ่ม...
                        </>
                      ) : (
                        'เพิ่มลูกค้า'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowNewCustomerForm(false)
                        setNewCustomerName('')
                        setNewCustomerPhone('')
                      }}
                      className="bg-transparent">
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Customer Display */}
          {selectedCustomer && data.customerName && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium ">
                ✓ เลือกลูกค้า: {data.customerName}
              </p>
              <p className="text-xs ">เบอร์: {data.customerPhone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrev}
            className="flex-1 bg-transparent">
            ย้อนกลับ
          </Button>
        )}
        <Button onClick={onNext} disabled={!canProceed} className="flex-1">
          ถัดไป
        </Button>
      </div>
    </div>
  )
}
