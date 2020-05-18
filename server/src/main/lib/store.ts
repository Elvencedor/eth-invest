const store:any = {
  exchangeRates: {},
  forexRates: {}
}

export function get(key:string) {
  return store[key]
}

export function set(key:string, obj:any) {
  store[key] = { ...store[key], ...obj }
}
