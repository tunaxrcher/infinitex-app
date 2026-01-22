import type { TitleDeed } from '@prisma/client'
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class TitleDeedRepository extends BaseRepository<typeof prisma.titleDeed> {
  constructor() {
    super(prisma.titleDeed)
  }

  /**
   * Find all title deeds by application ID
   */
  async findByApplicationId(applicationId: string) {
    return this.model.findMany({
      where: { applicationId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
  }

  /**
   * Find title deed by ID
   */
  async findById(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        application: true,
      },
    })
  }

  /**
   * Create a new title deed
   */
  async createTitleDeed(data: {
    applicationId: string
    imageUrl: string
    imageKey?: string
    deedNumber?: string
    provinceCode?: string
    provinceName?: string
    amphurCode?: string
    amphurName?: string
    parcelNo?: string
    landAreaRai?: number
    landAreaNgan?: number
    landAreaWa?: number
    landAreaText?: string
    ownerName?: string
    landType?: string
    analysisResult?: any
    valuationData?: any
    estimatedValue?: number
    latitude?: string
    longitude?: string
    linkMap?: string
    sortOrder?: number
    isPrimary?: boolean
  }) {
    return this.model.create({
      data: {
        applicationId: data.applicationId,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        deedNumber: data.deedNumber,
        provinceCode: data.provinceCode,
        provinceName: data.provinceName,
        amphurCode: data.amphurCode,
        amphurName: data.amphurName,
        parcelNo: data.parcelNo,
        landAreaRai: data.landAreaRai,
        landAreaNgan: data.landAreaNgan,
        landAreaWa: data.landAreaWa,
        landAreaText: data.landAreaText,
        ownerName: data.ownerName,
        landType: data.landType,
        analysisResult: data.analysisResult,
        valuationData: data.valuationData,
        estimatedValue: data.estimatedValue,
        latitude: data.latitude,
        longitude: data.longitude,
        linkMap: data.linkMap,
        sortOrder: data.sortOrder ?? 0,
        isPrimary: data.isPrimary ?? false,
      },
    })
  }

  /**
   * Update title deed
   */
  async updateTitleDeed(
    id: string,
    data: Partial<{
      imageUrl: string
      imageKey: string
      deedNumber: string
      provinceCode: string
      provinceName: string
      amphurCode: string
      amphurName: string
      parcelNo: string
      landAreaRai: number
      landAreaNgan: number
      landAreaWa: number
      landAreaText: string
      ownerName: string
      landType: string
      analysisResult: any
      valuationData: any
      estimatedValue: number
      latitude: string
      longitude: string
      linkMap: string
      sortOrder: number
      isPrimary: boolean
    }>
  ) {
    return this.model.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete title deed
   */
  async deleteTitleDeed(id: string) {
    return this.model.delete({
      where: { id },
    })
  }

  /**
   * Set title deed as primary (and unset others)
   */
  async setPrimary(id: string, applicationId: string) {
    // Unset all other primary deeds for this application
    await this.model.updateMany({
      where: { applicationId, isPrimary: true },
      data: { isPrimary: false },
    })

    // Set this deed as primary
    return this.model.update({
      where: { id },
      data: { isPrimary: true },
    })
  }

  /**
   * Get count of title deeds for an application
   */
  async getCountByApplicationId(applicationId: string) {
    return this.model.count({
      where: { applicationId },
    })
  }

  /**
   * Calculate total estimated value for an application
   */
  async getTotalEstimatedValue(applicationId: string) {
    const result = await this.model.aggregate({
      where: { applicationId },
      _sum: {
        estimatedValue: true,
      },
    })
    return result._sum.estimatedValue ?? 0
  }

  /**
   * Bulk create title deeds
   */
  async createMany(
    titleDeeds: Array<{
      applicationId: string
      imageUrl: string
      imageKey?: string
      deedNumber?: string
      provinceCode?: string
      provinceName?: string
      amphurCode?: string
      amphurName?: string
      parcelNo?: string
      landAreaText?: string
      ownerName?: string
      estimatedValue?: number
      sortOrder?: number
      isPrimary?: boolean
    }>
  ) {
    return this.model.createMany({
      data: titleDeeds.map((deed, index) => ({
        applicationId: deed.applicationId,
        imageUrl: deed.imageUrl,
        imageKey: deed.imageKey,
        deedNumber: deed.deedNumber,
        provinceCode: deed.provinceCode,
        provinceName: deed.provinceName,
        amphurCode: deed.amphurCode,
        amphurName: deed.amphurName,
        parcelNo: deed.parcelNo,
        landAreaText: deed.landAreaText,
        ownerName: deed.ownerName,
        estimatedValue: deed.estimatedValue,
        sortOrder: deed.sortOrder ?? index,
        isPrimary: deed.isPrimary ?? index === 0,
      })),
    })
  }

  /**
   * Delete all title deeds for an application
   */
  async deleteByApplicationId(applicationId: string) {
    return this.model.deleteMany({
      where: { applicationId },
    })
  }
}

export const titleDeedRepository = new TitleDeedRepository()
