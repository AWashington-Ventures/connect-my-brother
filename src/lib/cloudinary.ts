/**
 * Cloudinary signed upload utility.
 * Uses server-side signed upload flow for security.
 * The signing endpoint (/api/cloudinary/sign) keeps the API secret server-side.
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'video' = 'image'
): Promise<string> {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'weywf5mi'

  // Step 1: Get a signed upload signature from the server
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!signRes.ok) {
    throw new Error('Failed to obtain upload signature')
  }

  const { signature, timestamp, apiKey, uploadPreset } = await signRes.json()

  // Step 2: Upload directly to Cloudinary with the signed parameters
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )

  if (!uploadRes.ok) throw new Error('Upload failed')
  const data = await uploadRes.json()
  return data.secure_url
}
