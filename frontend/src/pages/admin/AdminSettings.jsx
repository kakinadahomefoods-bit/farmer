import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { toast } from 'react-toastify'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const logoRef = useRef(null)
  const faviconRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings()
        setSettings(data || {})
      } catch (err) { toast.error(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleChange = (path, value) => {
    setSettings(prev => {
      const keys = path.split('.')
      const newSettings = { ...prev }
      let obj = newSettings
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateSettings(settings)
      toast.success('Settings saved')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleLogoUpload = async (e, field) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const result = await api.uploadImage(file, 'haifarmer/settings')
      handleChange(field, result.url)
      toast.success('Image uploaded')
    } catch (err) { toast.error(err.message) }
  }

  const Input = ({ label, path, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={getNestedValue(settings, path) || ''} onChange={e => handleChange(path, e.target.value)} rows={3} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={getNestedValue(settings, path) || false} onChange={e => handleChange(path, e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          <span className="text-sm text-slate-600">{placeholder}</span>
        </label>
      ) : (
        <input type={type} value={getNestedValue(settings, path) || ''} onChange={e => handleChange(path, e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
      )}
    </div>
  )

  const tabs = ['general', 'delivery', 'payment', 'seo', 'footer', 'slider']

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <button onClick={handleSave} disabled={saving} className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${activeTab === tab ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab}</button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">General Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Store Name" path="storeName" />
              <Input label="Tagline" path="tagline" />
              <Input label="Phone" path="phone" />
              <Input label="Email" path="email" type="email" />
              <Input label="WhatsApp Number" path="whatsapp" />
              <Input label="Address" path="address" />
              <Input label="Google Maps URL" path="googleMapsUrl" />
              <Input label="Business Hours" path="businessHours" />
              <Input label="Header Text 1" path="headerText1" />
              <Input label="Header Text 2" path="headerText2" />
              <Input label="GST" path="gst" />
              <Input label="Tax (%)" path="tax" type="number" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
                {settings?.logo && <img src={settings.logo} alt="" className="h-16 mb-2 rounded-lg" />}
                <button type="button" onClick={() => logoRef.current?.click()} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-brand-400">Upload Logo</button>
                <input ref={logoRef} type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'logo')} hidden />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Favicon</label>
                {settings?.favicon && <img src={settings.favicon} alt="" className="h-10 mb-2" />}
                <button type="button" onClick={() => faviconRef.current?.click()} className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-brand-400">Upload Favicon</button>
                <input ref={faviconRef} type="file" accept="image/*" onChange={e => handleLogoUpload(e, 'favicon')} hidden />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Free Delivery Min Amount (₹)" path="freeDeliveryMin" type="number" />
              <Input label="Delivery Charge (₹)" path="deliveryCharge" type="number" />
              <div className="sm:col-span-2"><Input label="Delivery Message" path="deliveryMessage" /></div>
              <Input label="Express Delivery" path="expressDelivery" type="checkbox" placeholder="Enable Express Delivery" />
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Razorpay ON/OFF" path="razorpayEnabled" type="checkbox" placeholder="Enable Razorpay online payments" />
              <Input label="Razorpay Key ID" path="razorpayKeyId" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select value={settings?.paymentMethod || 'both'} onChange={e => handleChange('paymentMethod', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="both">Razorpay + WhatsApp</option>
                  <option value="razorpay">Razorpay Only</option>
                  <option value="whatsapp">WhatsApp Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">SEO Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Meta Title" path="seo.metaTitle" />
              <Input label="Meta Description" path="seo.metaDescription" type="textarea" />
              <Input label="Canonical URL" path="seo.canonicalUrl" />
              <Input label="Google Analytics ID" path="seo.googleAnalyticsId" />
              <Input label="Google Tag Manager ID" path="seo.googleTagManagerId" />
              <Input label="Google Search Console Verification" path="seo.googleSearchConsoleVerification" />
              <Input label="Bing Webmaster Verification" path="seo.bingWebmasterVerification" />
              <Input label="Facebook Pixel ID" path="seo.facebookPixelId" />
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Footer Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Company Name" path="footer.companyName" />
              <Input label="About Text" path="footer.aboutText" type="textarea" />
              <Input label="Privacy Policy URL" path="footer.privacyPolicyUrl" />
              <Input label="Refund Policy URL" path="footer.refundPolicyUrl" />
              <Input label="Shipping Policy URL" path="footer.shippingPolicyUrl" />
              <Input label="Terms URL" path="footer.termsUrl" />
              <Input label="FAQ URL" path="footer.faqUrl" />
              <Input label="Contact URL" path="footer.contactUrl" />
              <Input label="Facebook URL" path="footer.socialLinks.facebook" />
              <Input label="Instagram URL" path="footer.socialLinks.instagram" />
              <Input label="Twitter URL" path="footer.socialLinks.twitter" />
              <Input label="YouTube URL" path="footer.socialLinks.youtube" />
            </div>
          </div>
        )}

        {activeTab === 'slider' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Slider Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slider Mode</label>
                <select value={settings?.sliderSettings?.mode || 'both'} onChange={e => handleChange('sliderSettings.mode', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="both">Manual + Automatic</option>
                </select>
              </div>
              <Input label="Transition Speed (ms)" path="sliderSettings.transitionSpeed" type="number" />
              <Input label="Auto Play" path="sliderSettings.autoPlay" type="checkbox" placeholder="Enable auto play" />
              <Input label="Loop" path="sliderSettings.loop" type="checkbox" placeholder="Enable loop" />
              <Input label="Pause on Hover" path="sliderSettings.pauseOnHover" type="checkbox" placeholder="Pause on hover" />
              <Input label="Show Navigation Arrows" path="sliderSettings.showArrows" type="checkbox" placeholder="Show arrows" />
              <Input label="Show Pagination Dots" path="sliderSettings.showDots" type="checkbox" placeholder="Show dots" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getNestedValue(obj, path) {
  if (!obj) return ''
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? ''
}
