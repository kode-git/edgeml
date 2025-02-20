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
    
      /**
       * Define the log in relation to the message and different severity with the format [<timestamp>] <severity> - <message>
       * @param message is the log to show
       * @param severity is the level of the log to show
       */
      private static log(message: string, severity : Severity): void {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] ${severity} - ${message}`); 
      //  warning: javascript is single-thread, massive logging provides a memory intensive operations
    }
  
  }