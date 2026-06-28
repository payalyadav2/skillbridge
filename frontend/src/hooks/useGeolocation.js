import { useState, useCallback } from 'react'
export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return Promise.reject(new Error('Geolocation not supported'))
    }
    setIsLoading(true)
    setError(null)
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude }
          setLocation(coords)
          setIsLoading(false)
          resolve(coords)
        },
        (err) => {
          const msg = err.code === 1 ? 'Location access denied' : 'Failed to get location'
          setError(msg)
          setIsLoading(false)
          reject(new Error(msg))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    })
  }, [])
  return { location, error, isLoading, getLocation }
}
