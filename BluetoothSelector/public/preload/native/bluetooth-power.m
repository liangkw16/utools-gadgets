#import <Foundation/Foundation.h>
#import <IOBluetooth/IOBluetooth.h>

#include <sysexits.h>
#include <unistd.h>

int IOBluetoothPreferencesAvailable(void);
int IOBluetoothPreferenceGetControllerPowerState(void);
void IOBluetoothPreferenceSetControllerPowerState(int state);

static void emit(NSDictionary *payload, int exitCode) {
  NSData *data = [NSJSONSerialization dataWithJSONObject:payload options:0 error:nil];
  NSFileHandle *stdoutHandle = [NSFileHandle fileHandleWithStandardOutput];
  [stdoutHandle writeData:data];
  [stdoutHandle writeData:[NSData dataWithBytes:"\n" length:1]];
  exit(exitCode);
}

static void emitSuccess(NSString *action) {
  emit(@{
    @"ok": @YES,
    @"action": action
  }, EX_OK);
}

static void emitFailure(NSString *code, NSString *message, int exitCode) {
  emit(@{
    @"ok": @NO,
    @"error": @{
      @"code": code,
      @"message": message
    }
  }, exitCode);
}

static BOOL waitForPowerState(int expectedState) {
  for (int attempt = 0; attempt <= 100; attempt++) {
    if (attempt > 0) {
      usleep(100000);
    }

    if (IOBluetoothPreferenceGetControllerPowerState() == expectedState) {
      return YES;
    }
  }

  return NO;
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc < 2) {
      emitFailure(@"INVALID_ARGUMENTS", @"Missing target power state", EX_USAGE);
    }

    NSString *requestedState = [NSString stringWithUTF8String:argv[1]];
    BOOL poweredOn = NO;

    if ([requestedState isEqualToString:@"on"]) {
      poweredOn = YES;
    } else if (![requestedState isEqualToString:@"off"]) {
      emitFailure(@"INVALID_ARGUMENTS", @"Unsupported target power state", EX_USAGE);
    }

    if (!IOBluetoothPreferencesAvailable()) {
      emitFailure(@"HOST_UNAVAILABLE", @"Bluetooth controller is not available", EX_UNAVAILABLE);
    }

    int expectedState = poweredOn ? 1 : 0;
    NSString *action = poweredOn ? @"power-on" : @"power-off";

    if (IOBluetoothPreferenceGetControllerPowerState() == expectedState) {
      emitSuccess(action);
    }

    IOBluetoothPreferenceSetControllerPowerState(expectedState);

    if (waitForPowerState(expectedState)) {
      emitSuccess(action);
    }

    emitFailure(@"POWER_CHANGE_FAILED", @"Failed to update Bluetooth power state", EX_IOERR);
  }
}
