'use client'

import type React from 'react'
import { useState } from 'react'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Phone, Plus, Search, User } from 'lucide-react'

interface AgentCustomerSelectionStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

// Mock existing customers for this agent
const existingCustomers = [
  {
    id: 'customer-1',
    name: 'นายสมชาย ใจดี',
    phoneNumber: '081-234-5678',
    loanCount: 2,
    status: 'ปกติ',
  },
  {
    id: 'customer-2',
    name: 'นางสมหญิง สวยดี',
    phoneNumber: '082-345-6789',
    loanCount: 1,
    status: 'ไม่ผ่าน',
  },
  {
    id: 'customer-3',
    name: 'นายประชา ดีมาก',
    phoneNumber: '083-456-7890',
    loanCount: 1,
    status: 'รออนุมัติ',
  },
]

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

  const filteredCustomers = existingCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
  )

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer.id)
    onUpdate({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phoneNumber,
    })
  }

  const handleNewCustomer = () => {
    if (newCustomerName.trim() && newCustomerPhone.trim()) {
      const newCustomerId = `new-customer-${Date.now()}`
      setSelectedCustomer(newCustomerId)
      onUpdate({
        customerId: newCustomerId,
        customerName: newCustomerName.trim(),
        customerPhone: newCustomerPhone.trim(),
      })
      setShowNewCustomerForm(false)
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

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'ปกติ':
        return 'default'
      case 'ไม่ผ่าน':
        return 'destructive'
      case 'รออนุมัติ':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getBadgeClassName = (status: string) => {
    if (status === 'รออนุมัติ') {
      return 'text-xs bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return 'text-xs'
  }

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

          {/* Existing Customers */}
          <div className="space-y-2">
            {filteredCustomers.map((customer) => (
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
                  {/* <Badge
                    variant={getBadgeVariant(customer.status)}
                    className={getBadgeClassName(customer.status)}>
                    {customer.status}
                  </Badge> */}
                </div>
              </div>
            ))}
          </div>

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
              <CardContent className="p-4 space-y-3">
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
                        !newCustomerName.trim() || !newCustomerPhone.trim()
                      }
                      className="flex-1">
                      เพิ่มลูกค้า
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
