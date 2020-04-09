const store:any = {
  exchangeRates: {}
}

export function get(key:string) {
  return store[key]
}

export function set(key:string, obj:any) {
  store[key] = { ...store[key], ...obj }
}
