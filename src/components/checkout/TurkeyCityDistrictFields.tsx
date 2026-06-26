import { useMemo } from 'react'
import {
  districtsForProvince,
  matchDistrictName,
  matchProvinceName,
  TURKEY_PROVINCES,
} from '@/data/turkeyLocation'

export const checkoutSelectCls =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

type Props = {
  city: string
  district: string
  onCityChange: (city: string) => void
  onDistrictChange: (district: string) => void
  idPrefix?: string
  selectClassName?: string
}

export function TurkeyCityDistrictFields({
  city,
  district,
  onCityChange,
  onDistrictChange,
  idPrefix = 'checkout',
  selectClassName = checkoutSelectCls,
}: Props) {
  const cityValue = useMemo(() => matchProvinceName(city), [city])
  const districtOptions = useMemo(() => districtsForProvince(cityValue), [cityValue])
  const districtValue = useMemo(() => {
    if (!cityValue) return ''
    const matched = matchDistrictName(cityValue, district)
    if (matched) return matched
    const trimmed = district.trim()
    return districtOptions.find((d) => d === trimmed) ?? ''
  }, [cityValue, district, districtOptions])

  const handleCityChange = (next: string) => {
    onCityChange(next)
    onDistrictChange('')
  }

  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-city`} className="block text-sm font-medium text-slate-700">
          İl
        </label>
        <select
          id={`${idPrefix}-city`}
          value={cityValue}
          onChange={(e) => handleCityChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">Seçiniz</option>
          {TURKEY_PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-district`} className="block text-sm font-medium text-slate-700">
          İlçe
        </label>
        <select
          id={`${idPrefix}-district`}
          value={districtValue}
          onChange={(e) => onDistrictChange(e.target.value)}
          className={selectClassName}
          disabled={!cityValue}
        >
          <option value="">{cityValue ? 'Seçiniz' : 'Önce il seçin'}</option>
          {districtOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}
