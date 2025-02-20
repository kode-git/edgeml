
// Due to the single thread nature of Javascript, the sleep is forced using timeout built-in
export function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }