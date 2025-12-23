/**
 * LINE Messaging API Integration
 * For sending Flex Messages to LINE groups
 */

// ============================================================
// CONSTANTS
// ============================================================

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
const LINE_GROUP_ID = process.env.LINE_GROUP_ID || ''
const LINE_API_URL = 'https://api.line.me/v2/bot/message/push'
const ADMIN_BASE_URL = 'https://admin-demo.unityx.group'

// Flex message styling constants
const COLORS = {
  PRIMARY: '#FF5F5F',
  BACKGROUND: '#333333',
  SECONDARY_BG: '#44536B',
  TEXT_WHITE: '#FFFFFF',
  TEXT_LIGHT: '#D0D4E2',
  TEXT_MUTED: '#B0B6C5',
} as const

// ============================================================
// TYPES
// ============================================================

export interface LoanFlexMessageData {
  amount: string
  ownerName: string
  propertyLocation?: string
  propertyArea?: string
  parcelNo?: string
  amphur?: string
  province?: string
  latitude?: string
  longitude?: string
  notes?: string
  titleDeedImageUrl?: string
  supportingImageUrls?: string[]
  loanApplicationId?: string
}

/**
 * Encode URL to ensure it's valid for LINE API
 * LINE API requires URLs to be properly encoded (spaces as %20, etc.)
 */
function encodeImageUrl(url: string): string {
  if (!url) return ''

  try {
    // Parse the URL to get its components
    const urlObj = new URL(url)

    // Encode the pathname (file path) properly
    // Split by '/' to preserve path structure, then encode each segment
    const encodedPathSegments = urlObj.pathname
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    urlObj.pathname = encodedPathSegments.join('/')

    return urlObj.toString()
  } catch {
    // If URL parsing fails, return as-is
    return url
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Build image layout for flex message
 */
function buildImageLayout(
  titleDeedUrl: string | null,
  supportingImages: string[]
) {
  const imageLayout: any = {
    type: 'box',
    layout: 'horizontal',
    height: '160px',
    contents: [],
  }

  if (titleDeedUrl?.startsWith('https://')) {
    imageLayout.contents.push({
      type: 'image',
      url: titleDeedUrl,
      size: 'full',
      aspectMode: 'cover',
      aspectRatio: '4:5',
      flex: 2,
    })
  }

  if (supportingImages.length > 0) {
    imageLayout.contents.push({
      type: 'box',
      layout: 'vertical',
      flex: 1,
      contents: supportingImages.map((url) => ({
        type: 'image',
        url,
        size: 'full',
        aspectMode: 'cover',
      })),
    })
  }

  return imageLayout
}

/**
 * Build location and parcel info text
 */
function buildInfoText(data: LoanFlexMessageData) {
  const locationParts = [
    data.ownerName,
    data.propertyLocation,
    data.propertyArea,
  ].filter(Boolean)

  const parcelParts = [
    data.parcelNo ? `เลขโฉนด ${data.parcelNo}` : null,
    data.amphur ? `อ.${data.amphur}` : null,
    data.province ? `จ.${data.province}` : null,
  ].filter(Boolean)

  return {
    locationText: locationParts.join(' | '),
    parcelInfoText: parcelParts.join(' • '),
  }
}

/**
 * Build footer buttons
 */
function buildFooter(data: LoanFlexMessageData) {
  const detailUrl = data.loanApplicationId
    ? `${ADMIN_BASE_URL}/loan/check/${data.loanApplicationId}`
    : ADMIN_BASE_URL

  const contents: any[] = [
    {
      type: 'button',
      style: 'primary',
      height: 'sm',
      action: { type: 'uri', label: 'ดูรายละเอียด', uri: detailUrl },
    },
  ]

  if (data.latitude && data.longitude) {
    contents.push({
      type: 'button',
      style: 'link',
      height: 'sm',
      action: {
        type: 'uri',
        label: 'ดู Maps',
        uri: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
      },
    })
  }

  return { type: 'box', layout: 'vertical', spacing: 'sm', contents }
}

// ============================================================
// MAIN FUNCTIONS
// ============================================================

/**
 * Create a Flex Message for loan application
 */
function createLoanFlexMessage(data: LoanFlexMessageData) {
  // Prepare images
  const supportingImages = (data.supportingImageUrls?.slice(0, 2) || [])
    .map(encodeImageUrl)
    .filter((url) => url?.startsWith('https://'))

  const titleDeedUrl = data.titleDeedImageUrl
    ? encodeImageUrl(data.titleDeedImageUrl)
    : null

  // Build components
  const imageLayout = buildImageLayout(titleDeedUrl, supportingImages)
  const { locationText, parcelInfoText } = buildInfoText(data)
  const footer = buildFooter(data)

  // Build content section
  const contentSection: any[] = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          backgroundColor: COLORS.PRIMARY,
          paddingAll: '4px',
          contents: [
            {
              type: 'text',
              text: 'ยื่นสินเชื่อ [จากหน้าเว็บ]',
              size: 'xs',
              weight: 'bold',
              color: COLORS.TEXT_WHITE,
              align: 'center',
            },
          ],
        },
      ],
    },
    {
      type: 'text',
      text: data.amount,
      weight: 'bold',
      size: 'lg',
      color: COLORS.TEXT_WHITE,
      margin: 'sm',
    },
  ]

  if (locationText) {
    contentSection.push({
      type: 'text',
      text: locationText,
      size: 'sm',
      color: COLORS.TEXT_LIGHT,
      wrap: true,
    })
  }

  if (parcelInfoText) {
    contentSection.push({
      type: 'text',
      text: parcelInfoText,
      size: 'xs',
      color: COLORS.TEXT_MUTED,
      margin: 'xs',
      wrap: true,
    })
  }

  if (data.notes) {
    contentSection.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: COLORS.SECONDARY_BG,
      paddingAll: '10px',
      margin: 'md',
      contents: [
        {
          type: 'text',
          text: data.notes,
          size: 'xs',
          color: COLORS.TEXT_WHITE,
          wrap: true,
        },
      ],
    })
  }

  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '0px',
      contents: [
        imageLayout,
        {
          type: 'box',
          layout: 'vertical',
          backgroundColor: COLORS.BACKGROUND,
          paddingAll: '16px',
          spacing: 'sm',
          contents: contentSection,
        },
      ],
    },
    footer,
  }
}

/**
 * Send Flex Message to LINE group
 */
export async function sendLoanApplicationToLine(
  data: LoanFlexMessageData
): Promise<{ success: boolean; error?: string }> {
  try {
    const flexMessage = createLoanFlexMessage(data)

    const response = await fetch(LINE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_GROUP_ID,
        messages: [
          {
            type: 'flex',
            altText: `คำขอสินเชื่อใหม่ ${data.amount} บาท`,
            contents: flexMessage,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[LINE API] Failed to send message:', errorText)
      return {
        success: false,
        error: `LINE API error: ${response.status} ${errorText}`,
      }
    }

    console.log('[LINE API] Message sent successfully')
    return { success: true }
  } catch (error) {
    console.error('[LINE API] Error sending message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Server-side function to send LINE message
 * This should be called from API routes, not client-side
 */
export async function sendLoanNotification(data: LoanFlexMessageData) {
  return sendLoanApplicationToLine(data)
}
