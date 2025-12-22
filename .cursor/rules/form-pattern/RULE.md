---
description: 'Pattern สำหรับ Forms ด้วย React Hook Form + Zod'
globs:
  - '**/*-form.tsx'
  - '**/*-dialog.tsx'
  - '**/components/**/*form*.tsx'
alwaysApply: false
---

# React Hook Form + Zod Pattern

## โครงสร้างพื้นฐาน

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateEntity } from '@src/features/[feature]/hooks'
import {
  type EntityCreateSchema,
  entityCreateSchema,
} from '@src/features/[feature]/validations'
import { Button } from '@src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/shared/ui/form'
import { Input } from '@src/shared/ui/input'
import { useForm } from 'react-hook-form'

interface EntityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntityFormDialog({
  open,
  onOpenChange,
}: EntityFormDialogProps) {
  const createMutation = useCreateEntity()

  const form = useForm<EntityCreateSchema>({
    resolver: zodResolver(entityCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    },
  })

  const onSubmit = (data: EntityCreateSchema) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มรายการใหม่</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

## Form Field Types

### Text Input

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>ชื่อ</FormLabel>
      <FormControl>
        <Input placeholder="กรอกชื่อ" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Number Input

```tsx
<FormField
  control={form.control}
  name="amount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>จำนวนเงิน</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="0.00"
          {...field}
          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea

```tsx
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>รายละเอียด</FormLabel>
      <FormControl>
        <Textarea
          placeholder="กรอกรายละเอียด"
          className="resize-none"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select

```tsx
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>สถานะ</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="เลือกสถานะ" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="ACTIVE">ใช้งาน</SelectItem>
          <SelectItem value="INACTIVE">ไม่ใช้งาน</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox

```tsx
<FormField
  control={form.control}
  name="hirePurchase"
  render={({ field }) => (
    <FormItem className="flex items-center gap-2">
      <FormControl>
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <FormLabel className="!mt-0">เช่าซื้อ</FormLabel>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Multi-Step Form Pattern (สำหรับ Loan Application)

```tsx
'use client'

import { useState } from 'react'

import { useSubmitLoanApplication } from '@src/features/loan/hooks'

export function LoanApplicationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<LoanApplicationData>>({})

  const submitMutation = useSubmitLoanApplication()

  const updateFormData = (data: Partial<LoanApplicationData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = () => {
    submitMutation.mutate(formData as LoanApplicationData, {
      onSuccess: () => {
        setCurrentStep(5) // Go to success step
      },
    })
  }

  return (
    <div>
      {currentStep === 1 && (
        <TitleDeedStep
          data={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <SupportingDocumentsStep
          data={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <LoanAmountStep
          data={formData}
          onUpdate={updateFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <ReviewStep
          data={formData}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={submitMutation.isPending}
        />
      )}
      {currentStep === 5 && <SuccessStep />}
    </div>
  )
}
```

## File Upload in Forms

```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const uploadMutation = useAnalyzeTitleDeed();

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
      return;
    }

    setSelectedFile(file);

    // Auto upload and analyze
    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        updateFormData({
          titleDeedImage: result.data.fileUrl,
          titleDeedData: result.data.analysis,
        });
      },
    });
  }
};

return (
  <div>
    <Input
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      disabled={uploadMutation.isPending}
    />
    {uploadMutation.isPending && <p>กำลังอัพโหลดและวิเคราะห์...</p>}
  </div>
);
```

## Key Patterns

### 1. Always use zodResolver

```tsx
const form = useForm({
  resolver: zodResolver(schema),  // สำคัญ!
  defaultValues: { ... },
});
```

### 2. Reset form on success

```tsx
onSuccess: () => {
  form.reset()
  onOpenChange(false)
}
```

### 3. Disable submit while pending

```tsx
<Button type="submit" disabled={mutation.isPending}>
  {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
</Button>
```

### 4. Handle number inputs

```tsx
onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
```

### 5. Loading states with sonner

```tsx
import { toast } from 'sonner'

const handleSubmit = () => {
  mutation.mutate(data, {
    onSuccess: () => {
      toast.success('บันทึกสำเร็จ')
    },
    onError: (error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}
```
