type Severity = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export class Logger {

    static info(message: string): void {
        Logger.log(message, 'INFO');
      }
    
      static warn(message: string): void {
        Logger.log(message, 'WARN');
      }
    
      static error(message: string): void {
        Logger.log(message, 'ERROR');
      }

      static debug(message: string): void {
        Logger.log(message, 'DEBUG');
      }
    

    private static log(message: string, severity : Severity): void {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${severity} - ${message}`); 
      //  warning: javascript is single-thread, massive logging provides a memory intensive operations
    }
  
  }