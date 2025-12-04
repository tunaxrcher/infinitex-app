/**
 * LINE Messaging API Integration
 * For sending Flex Messages to LINE groups
 */

const LINE_CHANNEL_ACCESS_TOKEN =
  '2L0DYeFg2bsr96g4q3No/BX4Sm0/CPeS7Bd1HAjjF+wZWKKaIo1/nx8+khZttnP+qxCazxUZyFRIFQ2QsNmp2rP6XPJ85p9Nni3FYLpBOBgckO0PAPZp30WJk4naQRvLERB+7mZxgfeoJ3QtHX7gFgdB04t89/1O/w1cDnyilFU='
const LINE_GROUP_ID = 'Cb7ac38e94371fd87b1bf972abf01a4d6'
const LINE_API_URL = 'https://api.line.me/v2/bot/message/push'

export interface LoanFlexMessageData {
  amount: string
  ownerName: string
  details?: string
  notes?: string
  titleDeedImageUrl?: string
  supportingImageUrls?: string[]
}

/**
 * Create a Flex Message for loan application
 */
function createLoanFlexMessage(data: LoanFlexMessageData) {
  // Get first two supporting images if available
  const supportingImages = data.supportingImageUrls?.slice(0, 2) || []

  // Build image layout
  const imageLayout: any = {
    type: 'box',
    layout: 'horizontal',
    height: '160px',
    contents: [],
  }

  if (data.titleDeedImageUrl) {
    imageLayout.contents.push({
      type: 'image',
      url: data.titleDeedImageUrl,
      size: 'full',
      aspectMode: 'cover',
      aspectRatio: '4:5',
      flex: 2,
    })
  }

  if (supportingImages.length > 0) {
    const supportingBox: any = {
      type: 'box',
      layout: 'vertical',
      flex: 1,
      contents: [],
    }

    supportingImages.forEach((url) => {
      supportingBox.contents.push({
        type: 'image',
        url: url,
        size: 'full',
        aspectMode: 'cover',
      })
    })

    imageLayout.contents.push(supportingBox)
  }

  // Build content section
  const contentSection: any[] = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          backgroundColor: '#FF5F5F',
          paddingAll: '4px',
          contents: [
            {
              type: 'text',
              text: 'ยื่นสินเชื่อ',
              size: 'xs',
              weight: 'bold',
              color: '#FFFFFF',
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
      color: '#FFFFFF',
      margin: 'sm',
    },
    {
      type: 'text',
      text: data.details || `${data.ownerName}`,
      size: 'sm',
      color: '#D0D4E2',
    },
  ]

  // Add notes section if notes exist
  if (data.notes) {
    contentSection.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#44536B',
      paddingAll: '10px',
      margin: 'md',
      contents: [
        {
          type: 'text',
          text: data.notes,
          size: 'xs',
          color: '#FFFFFF',
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
          backgroundColor: '#333333',
          paddingAll: '16px',
          spacing: 'sm',
          contents: contentSection,
        },
      ],
    },
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
